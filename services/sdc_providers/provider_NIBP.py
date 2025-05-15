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
    # start WS-Discovery
    ws_discovery = wsdiscovery.WSDiscovery(get_network_adapter().ip)
    ws_discovery.start()

    # DPWS model and device definitions
    dpws_model = dpws_types.ThisModelType(
        manufacturer='sdc11073',
        manufacturer_url='www.sdc11073.com',
        model_name='NIBP Module',
        model_number='1.0',
        model_url='www.draeger.com/model',
        presentation_url='www.draeger.com/model/presentation'
    )
    dpws_device = dpws_types.ThisDeviceType(
        friendly_name='NIBP Module',
        firmware_version='Version1',
        serial_number='98765'
    )

    mdib = ProviderMdib.from_mdib_file(str(mdib_path or pathlib.Path(__file__).parent.joinpath('reference_mdib.xml')))

    # create provider
    prov = provider.SdcProvider(
        ws_discovery=ws_discovery,
        this_model=dpws_model,
        this_device=dpws_device,
        device_mdib_container=mdib,
        epr=uuid.UUID('adbfacaa-cdef-1234-5678-abcdefabcdef'),
        ssl_context_container=None
    )

    # set safety classification on all descriptions
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

        # metrics descriptors
        desc_sys = prov.mdib.descriptions.handle.get_one('bps.ch0.nibp_module')
        desc_dia = prov.mdib.descriptions.handle.get_one('bpd.ch0.nibp_module')
        desc_map = prov.mdib.descriptions.handle.get_one('bpa.ch0.nibp_module')
        
        unit = (desc_sys.Unit.ConceptDescription[0].text
                if desc_sys.Unit and desc_sys.Unit.ConceptDescription else 'mmHg')

        # initialize metric states
        with prov.mdib.metric_state_transaction() as mgr:
            for desc in (desc_sys, desc_dia, desc_map):
                state = mgr.get_state(desc.Handle)
                if not state.MetricValue:
                    state.mk_metric_value()

        # simulation parameters
        base_sys, base_dia = 120.0, 80.0
        t = 0

        while True:
            try:
                # simulate physiological variation
                angle = t / 30.0
                sys_variation = math.sin(angle) * 5.0 + random.gauss(0, 1)
                dia_variation = math.sin(angle + math.pi/6) * 3.0 + random.gauss(0, 1)

                systolic = base_sys + sys_variation
                diastolic = base_dia + dia_variation
                # compute mean arterial pressure
                mean_art = (systolic + 2 * diastolic) / 3.0

                # constrain to technical range
                systolic = max(30.0, min(200.0, systolic))
                diastolic = max(30.0, min(200.0, diastolic))
                mean_art = max(30.0, min(200.0, mean_art))

                # quantize
                sys_val = decimal.Decimal(systolic).quantize(decimal.Decimal('1.0'))
                dia_val = decimal.Decimal(diastolic).quantize(decimal.Decimal('1.0'))
                map_val = decimal.Decimal(mean_art).quantize(decimal.Decimal('1.0'))

                # update metric states
                with prov.mdib.metric_state_transaction() as mgr:
                    st_sys = mgr.get_state(desc_sys.Handle)
                    st_dia = mgr.get_state(desc_dia.Handle)
                    st_map = mgr.get_state(desc_map.Handle)
                    st_sys.MetricValue.Value = sys_val
                    st_dia.MetricValue.Value = dia_val
                    st_map.MetricValue.Value = map_val

                logger.info(f'Set NIBP: sys={sys_val}{unit}, dia={dia_val}{unit}, map={map_val}{unit}')

                t += 1
                time.sleep(5)

            except Exception as loop_err:
                logger.error(f'Error in NIBP loop: {loop_err}')
                time.sleep(1)

    except KeyboardInterrupt:
        print("\nStopping NIBP provider...")
    except Exception as e:
        logger.error(f'Error: {e}')
    finally:
        if 'prov' in locals():
            prov.stop_all()
        if 'ws_discovery' in locals():
            prov.ws_discovery.stop()


if __name__ == '__main__':
    print("Starting NIBP provider...PICKO MATERNO")
    run_provider()
