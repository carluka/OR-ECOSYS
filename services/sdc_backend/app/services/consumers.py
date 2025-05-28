import os
import time
import logging
import json
import threading
import gc
from types import SimpleNamespace
from typing import Dict, Set, Optional, Callable
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
 
# Optimizacija za real-time
CONNECTION_TIMEOUT = float(os.getenv("SDC_CONNECTION_TIMEOUT", "5.0")) 
HEALTH_CHECK_INTERVAL = float(os.getenv("SDC_HEALTH_CHECK_INTERVAL", "60.0"))  
MAX_RETRY_ATTEMPTS = int(os.getenv("SDC_MAX_RETRY_ATTEMPTS", "3"))
MEMORY_CLEANUP_INTERVAL = float(os.getenv("SDC_MEMORY_CLEANUP_INTERVAL", "120.0"))  
DISCOVERY_INTERVAL = float(os.getenv("SDC_DISCOVERY_INTERVAL", "30.0")) 
 
on_metric_update = None
on_waveform_update = None
 
_connection_manager = None
_logger = None
_discovery_thread = None
_shutdown_event = threading.Event()
 
#Razred za povezavo z ciscenjem in nadzorom
class ConnectionManager:    
    def __init__(self, logger):
        self.logger = logger
        self.consumers: Dict[str, SdcConsumer] = {}
        self.mdibs: Dict[str, ConsumerMdib] = {}
        self.bindings: Dict[str, bool] = {} 
        self.retry_counts: Dict[str, int] = {}
        self.last_health_check = time.time()
        self.last_memory_cleanup = time.time()
        self.connection_lock = threading.Lock()
        self.all_targets_connected = False
    
    def is_connection_healthy(self, epr: str) -> bool:
        if epr not in self.consumers:
            return False
        
        try:
            client = self.consumers[epr]
            if hasattr(client, 'is_connected') and callable(client.is_connected):
                return client.is_connected()
            elif hasattr(client, '_client') and client._client is not None:
                return True
            else:
                mdib = self.mdibs.get(epr)
                if mdib and hasattr(mdib, 'mdib_version'):
                    _ = mdib.mdib_version
                    return True
                return False
        except Exception as e:
            return False
    
    #Odstranjevanje mrtvih povezav
    def cleanup_dead_connections(self):
        dead_eprs = []
        
        with self.connection_lock:
            for epr in list(self.consumers.keys()):
                if not self.is_connection_healthy(epr):
                    dead_eprs.append(epr)
        
        if dead_eprs:
            for epr in dead_eprs:
                self.remove_connection(epr, reason="health check failed")
            self.all_targets_connected = False
    
    def remove_connection(self, epr: str, reason: str = "manual removal"):
        with self.connection_lock:
            if epr in self.bindings:
                try:
                    mdib = self.mdibs.get(epr)
                    if mdib and hasattr(observableproperties, 'unbind'):
                        observableproperties.unbind(mdib)
                    elif mdib:
                        if hasattr(mdib, '_observers'):
                            mdib._observers.clear()
                except Exception as e:
                    self.logger.warning(f"[room={ROOM_UUID}] Failed to unbind observables for {epr}: {e}")
                del self.bindings[epr]
            
            if epr in self.consumers:
                try:
                    client = self.consumers[epr]
                    if hasattr(client, 'stop_all'):
                        client.stop_all()
                except Exception as e:
                    self.logger.warning(f"[room={ROOM_UUID}] Failed to stop consumer {epr}: {e}")
                del self.consumers[epr]
            
            if epr in self.mdibs:
                try:
                    mdib = self.mdibs[epr]
                    if hasattr(mdib, 'close'):
                        mdib.close()
                except Exception as e:
                    self.logger.warning(f"[room={ROOM_UUID}] Failed to close MDIB {epr}: {e}")
                del self.mdibs[epr]
            
            if epr in self.retry_counts:
                del self.retry_counts[epr]
    
    def rebind_all_observables(self):
        self.logger.info(f"[room={ROOM_UUID}] Rebinding observables for all connections...")
        
        with self.connection_lock:
            for epr in list(self.mdibs.keys()):
                self._bind_observables_for_epr(epr)
    
    def _bind_observables_for_epr(self, epr: str):
        try:
            mdib = self.mdibs.get(epr)
            if not mdib:
                self.logger.warning(f"[room={ROOM_UUID}] No MDIB found for {epr}")
                return False
            
            if epr in self.bindings:
                try:
                    if hasattr(observableproperties, 'unbind'):
                        observableproperties.unbind(mdib)
                    elif hasattr(mdib, '_observers'):
                        mdib._observers.clear()
                except Exception as e:
                    self.logger.debug(f"[room={ROOM_UUID}] Failed to unbind existing observables for {epr}: {e}")
                del self.bindings[epr]
            
            if not on_metric_update and not on_waveform_update:
                self.logger.debug(f"[room={ROOM_UUID}] No callbacks available for {epr}")
                return False
            
            try:
                metric_callback = on_metric_update if callable(on_metric_update) else None
                waveform_callback = on_waveform_update if callable(on_waveform_update) else None
                
                observableproperties.bind(
                    mdib,
                    metrics_by_handle=metric_callback,
                    waveform_by_handle=waveform_callback
                )
                
                self.bindings[epr] = True
                return True
                
            except Exception as bind_error:
                self.logger.error(f"[room={ROOM_UUID}] ❌ Failed to bind observables for {epr}: {bind_error}")
                
                try:
                    if hasattr(mdib, 'add_observer') and metric_callback:
                        mdib.add_observer(metric_callback)
                        self.bindings[epr] = True
                        return True
                    
                except Exception as alt_error:
                    self.logger.error(f"[room={ROOM_UUID}] ❌ Alternative binding also failed for {epr}: {alt_error}")
                
                return False
                
        except Exception as e:
            self.logger.error(f"[room={ROOM_UUID}] ❌ Failed to bind observables for {epr}: {e}")
            return False
    
    def add_connection(self, svc) -> bool:
        epr = svc.epr
        
        if self.retry_counts.get(epr, 0) >= MAX_RETRY_ATTEMPTS:
            self.logger.warning(f"[room={ROOM_UUID}] Max retry attempts reached for {epr}, skipping")
            return False
        
        try:
            start_time = time.time()
            client = SdcConsumer.from_wsd_service(
                svc, ssl_context_container=None, validate=True
            )
            
            if hasattr(client, 'set_timeout'):
                client.set_timeout(CONNECTION_TIMEOUT)
            
            client.start_all()
            
            if time.time() - start_time > CONNECTION_TIMEOUT:
                self.logger.warning(f"[room={ROOM_UUID}] Connection to {epr} took too long, stopping")
                client.stop_all()
                return False
            
            mdib = ConsumerMdib(client)
            mdib.init_mdib()
            
            with self.connection_lock:
                self.consumers[epr] = client
                self.mdibs[epr] = mdib
                
                binding_success = self._bind_observables_for_epr(epr)
                
                if epr in self.retry_counts:
                    del self.retry_counts[epr]
                
                if len(self.consumers) == len(TARGET_EPRS):
                    self.all_targets_connected = True
            
            self.logger.info(f"✅ Successfully connected to {epr} (binding: {'✅' if binding_success else '❌'})")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to connect to {epr}: {e}")
            
            self.retry_counts[epr] = self.retry_counts.get(epr, 0) + 1
            
            try:
                if 'client' in locals():
                    client.stop_all()
            except:
                pass
            
            return False
    
    def periodic_maintenance(self):
        current_time = time.time()
        
        if current_time - self.last_health_check >= HEALTH_CHECK_INTERVAL:
            self.logger.debug(f"[room={ROOM_UUID}] Performing health check...")
            self.cleanup_dead_connections()
            self.last_health_check = current_time
        
        if current_time - self.last_memory_cleanup >= MEMORY_CLEANUP_INTERVAL:
            self.logger.debug(f"[room={ROOM_UUID}] Performing memory cleanup...")
            gc.collect()  
            self.last_memory_cleanup = current_time
    
    def get_connected_eprs(self) -> Set[str]:
        with self.connection_lock:
            return set(self.consumers.keys())
    
    def get_binding_status(self) -> Dict[str, bool]:
        with self.connection_lock:
            return dict(self.bindings)
    
    def shutdown_all(self):
        with self.connection_lock:
            for epr in list(self.consumers.keys()):
                self.remove_connection(epr, reason="shutdown")
 
 
def rebind_callbacks():
    global _connection_manager, _logger
    if _connection_manager:
        _connection_manager.rebind_all_observables()
 
 
def discovery_worker(connection_manager, wsd, logger):
    iteration = 0
    
    while not _shutdown_event.is_set():
        try:
            iteration += 1
            logger.debug(f"[room={ROOM_UUID}] Discovery worker iteration #{iteration}")
            
            if connection_manager.all_targets_connected:
                connected_eprs = connection_manager.get_connected_eprs()
                if len(connected_eprs) == len(TARGET_EPRS):
                    connection_manager.periodic_maintenance()
                    _shutdown_event.wait(DISCOVERY_INTERVAL)
                    continue
                else:
                    connection_manager.all_targets_connected = False
            
            connection_manager.periodic_maintenance()
            
            #Trenutno povezani ERP 
            connected_eprs = connection_manager.get_connected_eprs()
            
            #Poglej ce katera povezava manjka in se povezi
            missing_eprs = TARGET_EPRS - connected_eprs
            if not missing_eprs:
                logger.debug(f"[room={ROOM_UUID}] All targets connected, skipping discovery")
                _shutdown_event.wait(DISCOVERY_INTERVAL)
                continue
            
            logger.debug(f"[room={ROOM_UUID}] Missing connections: {missing_eprs}")
            
            if USE_DISCOVERY:
                try:
                    services = wsd.search_services(types=SdcV1Definitions.MedicalDeviceTypesFilter)
                    discovered_eprs = {s.epr for s in services}
                    
                    matching_services = [s for s in services if s.epr in missing_eprs]
                    
                    if matching_services:
                        for svc in matching_services:
                            if _shutdown_event.is_set():
                                break
                            success = connection_manager.add_connection(svc)
                            if success:
                                logger.info(f"✅ Successfully connected to {svc.epr}")
                            else:
                                logger.error(f"❌ Failed to connect to {svc.epr}")
                    
                except Exception as e:
                    logger.error(f"❌ Error during WS-Discovery: {e}")
            else:
                for epr, target in zip(TARGET_EPRS, TARGETS):
                    if epr not in missing_eprs:
                        continue
                    
                    if _shutdown_event.is_set():
                        break
                    
                    host, port = target.split(":")
                    uuid_part = epr.replace('urn:uuid:', '')
                    svc = SimpleNamespace(
                        epr=epr,
                        x_addrs=[f"http://{host}:{port}/{uuid_part}"],
                        types=[SdcV1Definitions.MedicalDeviceQNames.MedicalDevice]
                    )
                    success = connection_manager.add_connection(svc)
                    if success:
                        logger.info(f"✅ Successfully connected to {epr}")
                    else:
                        logger.error(f"❌ Failed to connect to {epr}")
            
            _shutdown_event.wait(DISCOVERY_INTERVAL)
            
        except Exception as e:
            logger.error(f"❌ Error in discovery worker: {e}")
            _shutdown_event.wait(5.0) 
 
 
def run_multi_provider_consumer(discovery_interval: float = None):
    global _connection_manager, _logger, _discovery_thread
    
    if discovery_interval is None:
        discovery_interval = DISCOVERY_INTERVAL
    
    basic_logging_setup()
    _logger = logging.getLogger('sdc')
 
    _logger.info(f"   ROOM_UUID: {ROOM_UUID}")
 
    adapters = list(network.get_adapters())
    adapter = next(a for a in adapters if not a.is_loopback)
 
    if not TARGET_EPRS:
        _logger.error("❌ No TARGET_EPRS configured!")
        return
    
    if not USE_DISCOVERY and not TARGETS:
        _logger.error("❌ Static mode enabled but no TARGETS configured!")
        return
 
    _connection_manager = ConnectionManager(_logger)
    wsd = None
 
    try:
        if USE_DISCOVERY:
            wsd = WSDiscovery(adapter.ip)
            wsd.start()
 
        _discovery_thread = threading.Thread(
            target=discovery_worker,
            args=(_connection_manager, wsd, _logger),
            daemon=True,
            name="DiscoveryWorker"
        )
        _discovery_thread.start()
        
        try:
            while not _shutdown_event.is_set():
                _shutdown_event.wait(1.0)  
        except KeyboardInterrupt:
            _logger.info(f"[room={ROOM_UUID}] Interrupted by user, shutting down...")
 
    finally:
        _shutdown_event.set()
        
        if _discovery_thread and _discovery_thread.is_alive():
            _discovery_thread.join(timeout=5.0)
        
        _connection_manager.shutdown_all()
        if wsd:
            wsd.stop()
 
def get_consumers():
    global _connection_manager
    if _connection_manager:
        return _connection_manager.consumers
    return {}
 
 
if __name__ == '__main__':
    run_multi_provider_consumer()