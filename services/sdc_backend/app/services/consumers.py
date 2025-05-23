import os
import time
import logging
import json
from types import SimpleNamespace
from sdc11073 import network, observableproperties
from sdc11073.consumer import SdcConsumer
from sdc11073.mdib import ConsumerMdib
from sdc11073.wsdiscovery import WSDiscovery
from sdc11073.definitions_sdc import SdcV1Definitions
from sdc11073.loghelper import basic_logging_setup


ROOM_UUID = os.getenv("ROOM_UUID")

device_list = os.getenv("DEVICE_UUIDS", "[]")
try:
    raw = json.loads(device_list)
    if not isinstance(raw, list):
        raise ValueError("must be a JSON list")
    TARGET_EPRS = {
        u if u.startswith("urn:uuid:") else f"urn:uuid:{u}"
        for u in raw
    }
except ValueError as e:
    raise RuntimeError(f"Invalid DEVICE_UUIDS: {device_list!r} — {e}")

USE_DISCOVERY = os.getenv("SDC_USE_DISCOVERY", "true").lower() == "true"
TARGETS = [t for t in os.getenv("SDC_TARGETS", "").split(",") if t]


def run_multi_provider_consumer(discovery_interval: float = 5.0):
    basic_logging_setup()
    logger = logging.getLogger('sdc')

    # pick a non-loopback adapter
    adapter = next(a for a in network.get_adapters() if not a.is_loopback)
    logger.info(f"[room={ROOM_UUID}] Using adapter: {adapter.ip}")

    logger.info(f"[room={ROOM_UUID}] Target EPRs: {TARGET_EPRS!r}")

    consumers = {}
    wsd = None

    try:
        if USE_DISCOVERY:
            wsd = WSDiscovery(adapter.ip)
            wsd.start()
            logger.info(f"[room={ROOM_UUID}] Started WS-Discovery, will poll every {discovery_interval}s")
        else:
            logger.info(f"[room={ROOM_UUID}] Static mode: will connect to fixed targets {TARGETS!r}")

        iteration = 0
        while True:
            iteration += 1
            logger.debug(f"[room={ROOM_UUID}] === Discovery iteration #{iteration} ===")

            # discover services
            if USE_DISCOVERY:
                logger.debug(f"[room={ROOM_UUID}] Searching for all SDC providers via WS-Discovery...")
                services = wsd.search_services(types=SdcV1Definitions.MedicalDeviceTypesFilter)
                discovered_eprs = {s.epr for s in services}
                logger.info(f"[room={ROOM_UUID}] Discovered EPRs: {discovered_eprs}")
                # filter to targets
                matching_services = [s for s in services if s.epr in TARGET_EPRS]
            else:
                logger.debug(f"[room={ROOM_UUID}] Building static service stubs...")
                matching_services = []
                for epr, target in zip(TARGET_EPRS, TARGETS):
                    if epr in consumers:
                        continue  # already connected
                    host, port = target.split(":")
                    uuid_part = epr.replace('urn:uuid:', '')
                    svc = SimpleNamespace(
                        epr=epr,
                        x_addrs=[f"http://{host}:{port}/{uuid_part}"],
                        types=[SdcV1Definitions.MedicalDeviceQNames.MedicalDevice]
                    )
                    matching_services.append(svc)
                discovered_eprs = set(TARGET_EPRS)  # in static mode we assume all listed

            matched_eprs = {s.epr for s in matching_services}
            logger.info(f"[room={ROOM_UUID}] Services matching targets: {matched_eprs}")

            # if nothing new found
            if not matching_services:
                missing = TARGET_EPRS - discovered_eprs
                logger.warning(
                    "[room=%s] No matching providers this iteration. "
                    "Expected: %s; Discovered: %s; Missing: %s",
                    ROOM_UUID, TARGET_EPRS, discovered_eprs, missing
                )
            # try connect to newly discovered services
            for svc in matching_services:
                if svc.epr in consumers:
                    logger.debug(f"[room={ROOM_UUID}] Already connected to {svc.epr}, skipping")
                    continue
                try:
                    logger.info(f"[room={ROOM_UUID}] Connecting to provider: {svc.epr}")
                    client = SdcConsumer.from_wsd_service(
                        svc, ssl_context_container=None, validate=True
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

                    consumers[svc.epr] = client
                    logger.info(f"[room={ROOM_UUID}] Successfully connected to {svc.epr}")
                except Exception as e:
                    logger.error(f"[room={ROOM_UUID}] Failed to connect to {svc.epr}: {e}")

            # wait until next poll
            time.sleep(discovery_interval)

    except KeyboardInterrupt:
        logger.info(f"[room={ROOM_UUID}] Interrupted by user, shutting down...")
    finally:
        for client in consumers.values():
            client.stop_all()
        if wsd:
            wsd.stop()
        logger.info(f"[room={ROOM_UUID}] All consumers stopped.")


# callbacks can be set by the user of this module
on_metric_update = None
on_waveform_update = None


if __name__ == '__main__':
    run_multi_provider_consumer()
