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
        model_name='TestDevice2',
        model_number='1.0',
        model_url='www.draeger.com/model',
        presentation_url='www.draeger.com/model/presentation'
    )
    
    dpws_device = dpws_types.ThisDeviceType(
        friendly_name='TestDevice2',
        firmware_version='Version1',
        serial_number='54321'
    )

    mdib = ProviderMdib.from_mdib_file(str(mdib_path or pathlib.Path(__file__).parent.joinpath('reference_mdib.xml')))
    
    prov = provider.SdcProvider(
        ws_discovery=ws_discovery,
        this_model=dpws_model,
        this_device=dpws_device,
        device_mdib_container=mdib,
        epr=uuid.UUID('abcdefab-cdef-1234-5678-abcdefabcdef'),
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

        metric = prov.mdib.descriptions.handle.get_one('numeric.ch1.vmd1')

        unit = metric.Unit.ConceptDescription[0].text if metric.Unit and metric.Unit.ConceptDescription else "no unit"

        with prov.mdib.metric_state_transaction() as mgr:
            state = mgr.get_state(metric.Handle)
            if not state.MetricValue:
                state.mk_metric_value()

        current_spo2 = 98.0
        min_spo2, max_spo2 = 85.0, 100.0
        t = 0
        hypoxia_triggered = False
        hypoxia_duration = 0

        while True:
            try:
                sine_variation = math.sin(t / 30.0) * 0.3
                noise = random.gauss(0, 0.1)

                if hypoxia_triggered:
                    current_spo2 -= 0.2
                    hypoxia_duration -= 1
                    if hypoxia_duration <= 0:
                        hypoxia_triggered = False
                else:
                    current_spo2 += (98.0 - current_spo2) * 0.05 + sine_variation + noise

                    if random.random() < 0.01:
                        hypoxia_triggered = True
                        hypoxia_duration = random.randint(5, 10)

                current_spo2 = max(min_spo2, min(max_spo2, current_spo2))
                spo2_decimal = decimal.Decimal(current_spo2).quantize(decimal.Decimal('1.0'))

                with prov.mdib.metric_state_transaction() as mgr:
                    state = mgr.get_state(metric.Handle)
                    if not state.MetricValue:
                        state.mk_metric_value()
                    state.MetricValue.Value = spo2_decimal
                logger.info(f'Set SpO₂ to {spo2_decimal}{unit}')

                time.sleep(1)
                t += 1

            except Exception as e:
                logger.error(f'Error in main loop: {e}')
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
