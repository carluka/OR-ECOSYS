import logging
import time
from sdc11073 import network, observableproperties
from sdc11073.consumer import SdcConsumer
from sdc11073.mdib import ConsumerMdib
from sdc11073.wsdiscovery import WSDiscovery
from sdc11073.definitions_sdc import SdcV1Definitions
from sdc11073.loghelper import basic_logging_setup

on_metric_update = None
on_waveform_update = None 

TARGET_EPRS = [
    "urn:uuid:12345678-6f55-11ea-9697-123456789abc",
    "urn:uuid:abcdefab-cdef-1234-5678-abcdefabcdef",
]

def run_multi_provider_consumer():
    basic_logging_setup()
    logger = logging.getLogger('sdc')

    adapter = next(adapter for adapter in network.get_adapters() if adapter.is_loopback)
    logger.info(f'Using adapter: {adapter.ip}')

    wsd = WSDiscovery(adapter.ip)
    wsd.start()

    logger.info("Searching for all SDC providers...")
    services = wsd.search_services(types=SdcV1Definitions.MedicalDeviceTypesFilter)

    matching_services = [s for s in services if s.epr in TARGET_EPRS]

    if not matching_services:
        logger.warning("No matching providers found.")
        return

    consumers = []

    for service in matching_services:
        try:
            logger.info(f"Connecting to provider: {service.epr}")
            client = SdcConsumer.from_wsd_service(service, ssl_context_container=None, validate=True)
            client.start_all()

            mdib = ConsumerMdib(client)
            mdib.init_mdib()

            if on_metric_update or on_waveform_update:
                observableproperties.bind(mdib, metrics_by_handle=on_metric_update, waveform_by_handle=on_waveform_update)

            consumers.append(client)
        except Exception as e:
            logger.error(f"Failed to connect to {service.epr}: {e}")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Stopping consumers...")
    finally:
        for client in consumers:
            client.stop_all()
        wsd.stop()
