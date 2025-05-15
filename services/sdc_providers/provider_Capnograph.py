import decimal
import logging
import os
import pathlib
import time
import uuid
import random
import math
from sdc11073 import location, network, provider, wsdiscovery
from sdc11073.mdib import ProviderMdib
from sdc11073.xml_types import dpws_types, pm_types
from sdc11073.loghelper import basic_logging_setup


def get_network_adapter() -> network.NetworkAdapter:
    if (ip := os.getenv('ref_ip')) is not None:
        return network.get_adapter_containing_ip(ip)
    return next(adapter for adapter in network.get_adapters() if adapter.is_loopback)


def create_provider(mdib_path: pathlib.Path | None = None) -> provider.SdcProvider:
    ws_discovery = wsdiscovery.WSDiscovery(get_network_adapter().ip)
    ws_discovery.start()

    dpws_model = dpws_types.ThisModelType(
        manufacturer='sdc11073',
        manufacturer_url='www.sdc11073.com',
        model_name='Capnograph',
        model_number='1.0',
        model_url='www.draeger.com/model',
        presentation_url='www.draeger.com/model/presentation'
    )
    dpws_device = dpws_types.ThisDeviceType(
        friendly_name='Capnograph',
        firmware_version='Version1',
        serial_number='98765'
    )

    mdib = ProviderMdib.from_mdib_file(str(mdib_path or pathlib.Path(__file__).parent.joinpath('reference_mdib.xml')))

    prov = provider.SdcProvider(
        ws_discovery=ws_discovery,
        this_model=dpws_model,
        this_device=dpws_device,
        device_mdib_container=mdib,
        epr=uuid.UUID('adfadfcc-cdef-1234-5678-abcdefabcdef'),
        ssl_context_container=None
    )

    for desc in prov.mdib.descriptions.objects:
        desc.SafetyClassification = pm_types.SafetyClassification.MED_A

    prov.start_all(start_rtsample_loop=False)
    return prov


def set_provider_data(prov: provider.SdcProvider):
    loc = location.SdcLocation(
        fac=os.getenv('ref_fac', 'fac'),
        poc=os.getenv('ref_poc', 'poc'),
        bed=os.getenv('ref_bed', 'bed')
    )
    prov.set_location(loc, [pm_types.InstanceIdentifier('Validator', extension_string='System')])


def run_provider():
    basic_logging_setup()
    logger = logging.getLogger('sdc')

    try:
        prov = create_provider()
        set_provider_data(prov)

        desc_co2 = prov.mdib.descriptions.handle.get_one('co2.ch0.capnograph')
        desc_rf = prov.mdib.descriptions.handle.get_one('rf.ch0.capnograph')

        unit_co2 = (desc_co2.Unit.ConceptDescription[0].text
                    if desc_co2.Unit and desc_co2.Unit.ConceptDescription else 'mmHg')
        unit_rf = (desc_rf.Unit.ConceptDescription[0].text
                   if desc_rf.Unit and desc_rf.Unit.ConceptDescription else 'breaths/min')

        with prov.mdib.metric_state_transaction() as mgr:
            for desc in (desc_co2, desc_rf):
                state = mgr.get_state(desc.Handle)
                if not state.MetricValue:
                    state.mk_metric_value()

        base_co2 = 40.0      
        base_rf = 16.0        
        t = 0

        while True:
            try:
                co2_variation = math.sin(t / 10.0) * 5.0 + random.gauss(0, 1)
                rf_variation = random.gauss(0, 0.5)

                etco2 = base_co2 + co2_variation
                rr   = base_rf  + rf_variation

                etco2 = max(0.0, min(100.0, etco2))
                rr    = max(5.0,  min(40.0, rr))

                co2_val = decimal.Decimal(etco2).quantize(decimal.Decimal('1.0'))
                rf_val  = decimal.Decimal(rr).quantize(decimal.Decimal('1.0'))

                with prov.mdib.metric_state_transaction() as mgr:
                    state_co2 = mgr.get_state(desc_co2.Handle)
                    state_rf  = mgr.get_state(desc_rf.Handle)
                    state_co2.MetricValue.Value = co2_val
                    state_rf.MetricValue.Value  = rf_val

                logger.info(f'Set Capnograph: CO₂={co2_val}{unit_co2}, RR={rf_val}{unit_rf}')

                t += 1
                time.sleep(1)

            except Exception as loop_err:
                logger.error(f'Error in capnograph loop: {loop_err}', exc_info=True)
                time.sleep(1)


    except KeyboardInterrupt:
        print("\nStopping Capnograph provider...")
    except Exception as e:
        logger.error(f'Error: {e}')
    finally:
        if 'prov' in locals():
            prov.stop_all()
        if 'ws_discovery' in locals():
            prov.ws_discovery.stop()


if __name__ == '__main__':
    run_provider()
