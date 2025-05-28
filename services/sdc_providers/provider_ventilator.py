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
from sdc11073.xml_types import pm_types, dpws_types
from sdc11073.loghelper import basic_logging_setup


def get_network_adapter() -> network.NetworkAdapter:
    if (ip := os.getenv('ref_ip')) is not None:
        return network.get_adapter_containing_ip(ip)
    return next(adapter for adapter in network.get_adapters() if adapter.is_loopback)


def create_provider(mdib_path: pathlib.Path | None = None) -> provider.SdcProvider:
    raw_uuid = os.getenv('PROVIDER_UUID')
    if not raw_uuid:
        raise RuntimeError("Environment variable PROVIDER_UUID is not set")
    try:
        provider_uuid = uuid.UUID(raw_uuid)
    except ValueError:
        raise RuntimeError(f"Invalid PROVIDER_UUID: {raw_uuid!r} — must be a valid UUID string")
    ws_discovery = wsdiscovery.WSDiscovery(get_network_adapter().ip)
    ws_discovery.start()

    dpws_model = dpws_types.ThisModelType(
        manufacturer='sdc11073',
        manufacturer_url='www.sdc11073.com',
        model_name='Ventilator',
        model_number='1.0',
        model_url='www.draeger.com/model',
        presentation_url='www.draeger.com/model/presentation'
    )
    dpws_device = dpws_types.ThisDeviceType(
        friendly_name='Ventilator',
        firmware_version='Version1',
        serial_number='43215'
    )

    mdib = ProviderMdib.from_mdib_file(str(mdib_path or pathlib.Path(__file__).parent.joinpath('reference_mdib.xml')))

    prov = provider.SdcProvider(
        ws_discovery=ws_discovery,
        this_model=dpws_model,
        this_device=dpws_device,
        device_mdib_container=mdib,
        epr=provider_uuid,
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

        desc_vt   = prov.mdib.descriptions.handle.get_one('vol.ch0.mechanical_ventilator')
        desc_rf   = prov.mdib.descriptions.handle.get_one('rf.ch0.mechanical_ventilator')
        desc_fio2 = prov.mdib.descriptions.handle.get_one('ox_con.ch0.mechanical_ventilator')
        desc_peep = prov.mdib.descriptions.handle.get_one('peep.ch0.mechanical_ventilator')
        desc_pip  = prov.mdib.descriptions.handle.get_one('pip.ch0.mechanical_ventilator')

        unit_vt   = (desc_vt.Unit.ConceptDescription[0].text if desc_vt.Unit and desc_vt.Unit.ConceptDescription else 'ml')
        unit_rf   = (desc_rf.Unit.ConceptDescription[0].text if desc_rf.Unit and desc_rf.Unit.ConceptDescription else '1/min')
        unit_fio2 = (desc_fio2.Unit.ConceptDescription[0].text if desc_fio2.Unit and desc_fio2.Unit.ConceptDescription else '%')
        unit_peep = (desc_peep.Unit.ConceptDescription[0].text if desc_peep.Unit and desc_peep.Unit.ConceptDescription else 'cmH2O')
        unit_pip  = (desc_pip.Unit.ConceptDescription[0].text if desc_pip.Unit and desc_pip.Unit.ConceptDescription else 'cmH2O')

        with prov.mdib.metric_state_transaction() as mgr:
            for desc in (desc_vt, desc_rf, desc_fio2, desc_peep, desc_pip):
                state = mgr.get_state(desc.Handle)
                if not state.MetricValue:
                    state.mk_metric_value()

        base_vt, base_rf, base_fio2 = 500.0, 12.0, 40.0
        base_peep, base_pip            = 5.0, 20.0
        t = 0

        while True:
            try:
                vt_vari   = math.sin(t/20.0)*50 + random.gauss(0, 10)
                rf_vari   = random.gauss(0, 1)
                fio2_vari = random.gauss(0, 2)
                peep_vari = math.sin(t/30.0)*1 + random.gauss(0, 0.5)
                pip_vari  = math.sin(t/25.0)*2 + random.gauss(0, 1)

                vt_val   = base_vt + vt_vari
                rr_val   = base_rf + rf_vari
                fio2_val = base_fio2 + fio2_vari
                peep_val = base_peep + peep_vari
                pip_val  = base_pip + pip_vari

                vt_val   = max(100.0, min(1000.0, vt_val))
                rr_val   = max(5.0,   min(40.0,   rr_val))
                fio2_val = max(21.0,  min(100.0,  fio2_val))
                peep_val = max(0.0,   min(20.0,   peep_val))
                pip_val  = max(5.0,   min(50.0,   pip_val))

                vt_q   = decimal.Decimal(vt_val).quantize(decimal.Decimal('1.0'))
                rr_q   = decimal.Decimal(rr_val).quantize(decimal.Decimal('1.0'))
                fio2_q = decimal.Decimal(fio2_val).quantize(decimal.Decimal('1.0'))
                peep_q = decimal.Decimal(peep_val).quantize(decimal.Decimal('1.0'))
                pip_q  = decimal.Decimal(pip_val).quantize(decimal.Decimal('1.0'))

                with prov.mdib.metric_state_transaction() as mgr:
                    st_vt   = mgr.get_state(desc_vt.Handle)
                    st_rf   = mgr.get_state(desc_rf.Handle)
                    st_fio2 = mgr.get_state(desc_fio2.Handle)
                    st_peep = mgr.get_state(desc_peep.Handle)
                    st_pip  = mgr.get_state(desc_pip.Handle)
                    st_vt.MetricValue.Value   = vt_q
                    st_rf.MetricValue.Value   = rr_q
                    st_fio2.MetricValue.Value = fio2_q
                    st_peep.MetricValue.Value = peep_q
                    st_pip.MetricValue.Value  = pip_q

                logger.info(
                    f"Ventilator: Vt={vt_q}{unit_vt}, RR={rr_q}{unit_rf}, FiO2={fio2_q}{unit_fio2}, "
                    f"PEEP={peep_q}{unit_peep}, PIP={pip_q}{unit_pip}")

                t += 1
                time.sleep(1)

            except Exception as loop_err:
                logger.error(f"Error in ventilator loop: {loop_err}", exc_info=True)
                time.sleep(1)

    except KeyboardInterrupt:
        print("\nStopping ventilator provider...")
    except Exception as e:
        logger.error(f"Error in run_provider: {e}", exc_info=True)
    finally:
        if 'prov' in locals():
            prov.stop_all()
        if 'ws_discovery' in locals():
            prov.ws_discovery.stop()


if __name__ == '__main__':
    run_provider()