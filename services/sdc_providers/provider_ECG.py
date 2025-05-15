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
        model_name='ECG module',
        model_number='1.0',
        model_url='www.draeger.com/model',
        presentation_url='www.draeger.com/model/presentation'
    )
    
    dpws_device = dpws_types.ThisDeviceType(
        friendly_name='ECG module',
        firmware_version='Version1',
        serial_number='54321'
    )

    mdib = ProviderMdib.from_mdib_file(str(mdib_path or pathlib.Path(__file__).parent.joinpath('reference2_mdib.xml')))
    
    prov = provider.SdcProvider(
        ws_discovery=ws_discovery,
        this_model=dpws_model,
        this_device=dpws_device,
        device_mdib_container=mdib,
        epr=uuid.UUID('abcdefbb-cdef-1234-5678-abcdefabcdef'),
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

        # ECG metrics
        metric_hr = prov.mdib.descriptions.handle.get_one('heartRate.ch0.ecg_module')
        metric_rr = prov.mdib.descriptions.handle.get_one('rrInterval.ch0.ecg_module')
        metric_qrs = prov.mdib.descriptions.handle.get_one('qrsDuration.ch0.ecg_module')

        # Init all metric states
        for metric in [metric_hr, metric_rr, metric_qrs]:
            with prov.mdib.metric_state_transaction() as mgr:
                state = mgr.get_state(metric.Handle)
                if not state.MetricValue:
                    state.mk_metric_value()

        current_hr = 75  # bpm
        t = 0

        while True:
            try:
                # === Heart Rate (bpm) ===
                hr_noise = random.gauss(0, 1.5)
                current_hr += (75 - current_hr) * 0.05 + hr_noise
                current_hr = max(50, min(120, current_hr))
                hr_decimal = decimal.Decimal(current_hr).quantize(decimal.Decimal('1'))

                # RR interval = 60,000 / HR
                rr_value = 60000.0 / float(hr_decimal)
                rr_decimal = decimal.Decimal(rr_value).quantize(decimal.Decimal('1'))

                # QRS duration — small fluctuations
                qrs_value = 90 + math.sin(t / 30.0) * 10 + random.gauss(0, 3)
                qrs_value = max(60, min(140, qrs_value))
                qrs_decimal = decimal.Decimal(qrs_value).quantize(decimal.Decimal('1'))

                # Update heart rate
                with prov.mdib.metric_state_transaction() as mgr:
                    state = mgr.get_state(metric_hr.Handle)
                    state.MetricValue.Value = hr_decimal

                # Update RR interval
                with prov.mdib.metric_state_transaction() as mgr:
                    state = mgr.get_state(metric_rr.Handle)
                    state.MetricValue.Value = rr_decimal

                # Update QRS duration
                with prov.mdib.metric_state_transaction() as mgr:
                    state = mgr.get_state(metric_qrs.Handle)
                    state.MetricValue.Value = qrs_decimal

                logger.info(f'HR: {hr_decimal} bpm | RR: {rr_decimal} ms | QRS: {qrs_decimal} ms')

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
