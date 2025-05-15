import os
import time
import logging
from types import SimpleNamespace
from sdc11073 import network, observableproperties
from sdc11073.consumer import SdcConsumer
from sdc11073.mdib import ConsumerMdib
from sdc11073.wsdiscovery import WSDiscovery
from sdc11073.definitions_sdc import SdcV1Definitions
from sdc11073.loghelper import basic_logging_setup


TARGET_EPRS = [
    "urn:uuid:12345678-6f55-11ea-9697-123456789abc",  # BPM provider
    "urn:uuid:abcdefab-cdef-1234-5678-abcdefabcdef",# SpO2 provider
    "urn:uuid:abcdefff-cdef-1234-5678-abcdefabcdef",  
    "urn:uuid:abcdefaa-cdef-1234-5678-abcdefabcdef",
    "urn:uuid:abcdefbb-cdef-1234-5678-abcdefabcdef",
    "urn:uuid:abcdefcc-cdef-1234-5678-abcdefabcdef",
    "urn:uuid:adbfacaa-cdef-1234-5678-abcdefabcdef",  # NIBP provider
    "urn:uuid:adfadfcc-cdef-1234-5678-abcdefabcdef",  # Capnograph provider
]


USE_DISCOVERY = os.getenv("SDC_USE_DISCOVERY", "true").lower() == "true"
TARGETS = [t for t in os.getenv("SDC_TARGETS", "").split(",") if t]


def run_multi_provider_consumer():
    basic_logging_setup()
    logger = logging.getLogger('sdc')

   
    adapter = next(a for a in network.get_adapters() if not a.is_loopback) 
    logger.info(f'Using adapter: {adapter.ip}')

    if USE_DISCOVERY:
        
        wsd = WSDiscovery(adapter.ip)
        wsd.start()

        logger.info("Searching for all SDC providers via multicast...")
        services = wsd.search_services(types=SdcV1Definitions.MedicalDeviceTypesFilter)
        matching_services = [s for s in services if s.epr in TARGET_EPRS]
    else:
        logger.info(f"Static mode: connecting to targets {TARGETS}")
        matching_services = []
        for epr, target in zip(TARGET_EPRS, TARGETS):
            host, port = target.split(":")
            uuid_part = epr.replace('urn:uuid:', '')
            svc = SimpleNamespace()
            svc.epr = epr
            svc.x_addrs = [f"http://{host}:{port}/{uuid_part}"]
            svc.types = [SdcV1Definitions.MedicalDeviceQNames.MedicalDevice]  # <- nujno
            matching_services.append(svc)

    if not matching_services:
        logger.warning("No matching providers found.")
        if USE_DISCOVERY:
            wsd.stop()
        return

    consumers = []
    for service in matching_services:
        try:
            logger.info(f"Connecting to provider: {service.epr}")
            client = SdcConsumer.from_wsd_service(
                service,
                ssl_context_container=None,
                validate=True
            )
            client.start_all()

            mdib = ConsumerMdib(client)
            mdib.init_mdib()

            if on_metric_update or on_waveform_update:
                observableproperties.bind(
                    mdib,
                    metrics_by_handle=on_metric_update,
                    waveform_by_handle=on_waveform_update
                )

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
        if USE_DISCOVERY:
            wsd.stop()


on_metric_update = None
on_waveform_update = None


if __name__ == '__main__':
    run_multi_provider_consumer()
