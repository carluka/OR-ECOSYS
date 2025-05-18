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
from sdc11073.xml_types import pm_qnames as pm
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
        model_name='Infusion pump',
        model_number='1.0',
        model_url='www.draeger.com/model',
        presentation_url='www.draeger.com/model/presentation'
    )
    
    dpws_device = dpws_types.ThisDeviceType(
        friendly_name='Infusion pump',
        firmware_version='Version1',
        serial_number='54321'
    )

    mdib = ProviderMdib.from_mdib_file(str(mdib_path or pathlib.Path(__file__).parent.joinpath('reference_mdib.xml')))
    
    prov = provider.SdcProvider(
        ws_discovery=ws_discovery,
        this_model=dpws_model,
        this_device=dpws_device,
        device_mdib_container=mdib,
        epr=uuid.UUID('abcdefaa-cdef-1234-5678-abcdefabcdef'),
        ssl_context_container=None
    )

    for desc in prov.mdib.descriptions.objects:
        desc.SafetyClassification = pm_types.SafetyClassification.MED_A

    prov.start_all(start_rtsample_loop=False)
    return prov

def set_provider_data(prov: provider.SdcProvider):
    loc = location.SdcLocation(
        fac=os.getenv('ref_fac', default='fac'),
        poc=os.getenv('ref_poc', default='poc'),
        bed=os.getenv('ref_bed', default='bed')
    )
    prov.set_location(loc, [pm_types.InstanceIdentifier('Validator', extension_string='System')])

def run_provider():
    basic_logging_setup()
    logger = logging.getLogger('sdc')

    try:
        prov = create_provider()
        set_provider_data(prov)

        metric_name = prov.mdib.descriptions.handle.get_one('drugName.ch0.infusion_pump')
        metric_speed = prov.mdib.descriptions.handle.get_one('flowRate.ch0.infusion_pump')
        metric_total = prov.mdib.descriptions.handle.get_one('volumeTotal.ch0.infusion_pump')
        drug_names = ["Propofol", "Saline", "Dopamine", "Fentanyl", "Midazolam"]
        current_drug = random.choice(drug_names)

        infusion_rate = 25.0  
        total_volume = 0.0  
        t = 0

        with prov.mdib.metric_state_transaction() as mgr:
            state = mgr.get_state(metric_name.Handle)
            if not state.MetricValue:
                state.mk_metric_value()
            state.MetricValue.Value = current_drug

        while True:
            try:
                variation = math.sin(t / 20.0) * 0.5 + random.gauss(0, 0.2)
                infusion_rate_dynamic = max(0.0, infusion_rate + variation)

                total_volume += infusion_rate_dynamic / 3600.0  

                rate_decimal = decimal.Decimal(infusion_rate_dynamic).quantize(decimal.Decimal('0.1'))
                total_decimal = decimal.Decimal(total_volume).quantize(decimal.Decimal('1'))

                with prov.mdib.metric_state_transaction() as mgr:
                    state = mgr.get_state(metric_speed.Handle)
                    if not state.MetricValue:
                        state.mk_metric_value()
                    state.MetricValue.Value = rate_decimal

                with prov.mdib.metric_state_transaction() as mgr:
                    state = mgr.get_state(metric_total.Handle)
                    if not state.MetricValue:
                        state.mk_metric_value()
                    state.MetricValue.Value = total_decimal

                logger.info(f"Infusing {current_drug}: {rate_decimal} ml/h, total {total_decimal} ml")

                time.sleep(1)
                t += 1

            except Exception as e:
                logger.error(f'Error in infusion simulation: {e}')
                time.sleep(1)

    except KeyboardInterrupt:
        print("\nStopping provider...")
    except Exception as e:
        logger.error(f'Error: {e}')
    finally:
        if 'prov' in locals():
            prov.stop_all()
        if 'ws_discovery' in locals():
            ws_discovery.stop()

if __name__ == '__main__':
    run_provider()
