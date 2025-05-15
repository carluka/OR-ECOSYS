import asyncio
import logging
import uuid
import random
import json
import neurokit2 as nk
import decimal
import time
import pathlib
import os
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
        epr=uuid.UUID('abcdefcc-cdef-1234-5678-abcdefabcdef'),
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

        metric_ecg = prov.mdib.descriptions.handle.get_one('ecgWaveform.ch0.ecg_module2')

        with prov.mdib.metric_state_transaction() as mgr:
            state = mgr.get_state(metric_ecg.Handle)
            if not state.MetricValue:
                state.mk_metric_value()

        sampling_rate = 500
        duration = 1  # seconds

        while True:
            ecg_signal = nk.ecg_simulate(duration=duration, sampling_rate=sampling_rate, method="ecgsyn")
            rounded_signal = [round(float(x), 4) for x in ecg_signal[:int(sampling_rate * duration)]]
            ecg_json = json.dumps(rounded_signal)

            with prov.mdib.metric_state_transaction() as mgr:
                state = mgr.get_state(metric_ecg.Handle)
                state.MetricValue.Value = ecg_json

            logger.info(f"Sent ECG waveform with {len(rounded_signal)} samples")
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

if __name__ == "__main__":
    run_provider()
