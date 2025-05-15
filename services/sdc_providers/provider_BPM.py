import os
import time
import uuid
import decimal
import random
import logging
import pathlib
from sdc11073 import network, wsdiscovery, provider, location
from sdc11073.mdib import ProviderMdib
from sdc11073.xml_types import dpws_types, pm_types
from sdc11073.loghelper import basic_logging_setup

# Environment variable names
REF_IP_ENV = 'REF_IP'
REF_FAC_ENV = 'REF_FAC'
REF_POC_ENV = 'REF_POC'
REF_BED_ENV = 'REF_BED'

# Default metric handle
METRIC_HANDLE = 'heart_rate.ch0.ekg_modul'


def get_network_adapter() -> network.NetworkAdapter:
    """
    Choose network adapter for WS-Discovery and DPWS.
    - If REF_IP env var is set, picks adapter with that IP.
    - Else, picks first non-loopback adapter.
    - Fallback: loopback adapter.
    """
    # 1) check explicit override
    ip = os.getenv(REF_IP_ENV)
    if ip:
        try:
            return network.get_adapter_containing_ip(ip)
        except Exception:
            pass

    # 2) first non-loopback
    for adapter in network.get_adapters():
        if not adapter.is_loopback:
            return adapter

    # 3) fallback to loopback
    return next(adapter for adapter in network.get_adapters() if adapter.is_loopback)


def create_provider(mdib_path: pathlib.Path | None = None) -> provider.SdcProvider:
    """
    Create and start an SDC provider with DPWS/WSDiscovery.
    """
    # Setup WS-Discovery on chosen adapter
    adapter = get_network_adapter()
    ws = wsdiscovery.WSDiscovery(adapter.ip)
    ws.start()

    # DPWS device description
    dpws_model = dpws_types.ThisModelType(
        manufacturer='sdc11073',
        manufacturer_url='www.sdc11073.com',
        model_name='TestDevice',
        model_number='1.0',
        model_url='www.draeger.com/model',
        presentation_url='www.draeger.com/model/presentation'
    )
    dpws_device = dpws_types.ThisDeviceType(
        friendly_name='TestDevice',
        firmware_version='Version1',
        serial_number='12345'
    )

    # Load MDIB (device description) from file
    xml_file = pathlib.Path(__file__).parent.joinpath('reference_mdib.xml')
    mdib = ProviderMdib.from_mdib_file(str(mdib_path or xml_file))

    # Create provider instance
    prov = provider.SdcProvider(
        ws_discovery=ws,
        this_model=dpws_model,
        this_device=dpws_device,
        device_mdib_container=mdib,
        epr=uuid.UUID('12345678-6f55-11ea-9697-123456789abc'),
        ssl_context_container=None
    )

    # Mark all objects as medical device
    for desc in prov.mdib.descriptions.objects:
        desc.SafetyClassification = pm_types.SafetyClassification.MED_A

    prov.start_all(start_rtsample_loop=False)
    return prov


def set_provider_data(prov: provider.SdcProvider):
    """
    Set initial location and identifiers for the provider.
    """
    # Build location from environment or defaults
    loc = location.SdcLocation(
        fac=os.getenv(REF_FAC_ENV, 'fac'),
        poc=os.getenv(REF_POC_ENV, 'poc'),
        bed=os.getenv(REF_BED_ENV, 'bed')
    )
    prov.set_location(loc, [pm_types.InstanceIdentifier('Validator', extension_string='System')])


def run_provider():
    """
    Main entrypoint: setup logging, start provider, update metrics.
    """
    basic_logging_setup()
    logger = logging.getLogger('sdc')

    prov = None
    ws = None
    try:
        # Create and configure provider
        prov = create_provider()
        set_provider_data(prov)

        # Select metric by handle
        metric = prov.mdib.descriptions.handle.get_one(METRIC_HANDLE)
        unit = metric.Unit.ConceptDescription[0].text if metric.Unit and metric.Unit.ConceptDescription else ''

        # Ensure metric value container exists
        with prov.mdib.metric_state_transaction() as mgr:
            state = mgr.get_state(metric.Handle)
            if not state.MetricValue:
                state.mk_metric_value()

        # Simulate metric updates every second
        current = 75.0
        min_val, max_val = 60.0, 100.0
        while True:
            try:
                delta = random.uniform(-2, 2)
                current = max(min_val, min(max_val, current + delta))
                val = decimal.Decimal(current).quantize(decimal.Decimal('1.0'))
                with prov.mdib.metric_state_transaction() as mgr:
                    state = mgr.get_state(metric.Handle)
                    state.MetricValue.Value = val
                logger.info(f'Set metric value to {val}{unit}')
                time.sleep(1)
            except Exception as e:
                logger.error(f'Error in update loop: {e}')
                time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping provider...")
    except Exception as e:
        logger.error(f'Provider error: {e}')
    finally:
        if prov:
            prov.stop_all()
        if ws:
            ws.stop()


if __name__ == '__main__':
    run_provider()
