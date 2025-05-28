from typing import Callable, Dict, Any
import asyncio
import logging
from datetime import datetime, timezone
from decimal import Decimal
import json
from confluent_kafka import Producer
from concurrent.futures import ThreadPoolExecutor
import time

from app.services import consumers

logger = logging.getLogger(__name__)

class MinimalOptimizedSDCConsumerService:
    def __init__(self):
        self._consumer_task: asyncio.Task | None = None
        self._is_running = False
        self._data_callbacks: list[Callable[[Dict[str, Any]], None]] = []
        
        self._thread_pool = ThreadPoolExecutor(max_workers=3, thread_name_prefix="SDC-Async")
        
        self.producer = Producer({
            'bootstrap.servers': '127.0.0.1:9092',
            'batch.size': 8192,
            'linger.ms': 5,  
            'acks': 1,       
            'retries': 2,
        })

    def add_data_callback(self, callback: Callable[[Dict[str, Any]], None]):
        self._data_callbacks.append(callback)

    def remove_data_callback(self, callback: Callable[[Dict[str, Any]], None]):
        if callback in self._data_callbacks:
            self._data_callbacks.remove(callback)

    async def start(self):
        if self._is_running:
            return
        self._is_running = True
        self._consumer_task = asyncio.create_task(self._run())

    async def stop(self):
        if not self._is_running:
            return
        self._is_running = False
        if self._consumer_task:
            self._consumer_task.cancel()
            try:
                await self._consumer_task
            except asyncio.CancelledError:
                pass
        
        self._thread_pool.shutdown(wait=True)
        
        self.producer.flush(timeout=5.0)

    async def _run(self):
        def fast_metric_callback(metrics_by_handle: dict):
            try:
                for handle, metric in metrics_by_handle.items():
                    try:
                        value = metric.MetricValue.Value if metric.MetricValue else None
                        if isinstance(value, Decimal):
                            value = float(value)
                        
                        logger.info(f"📊 Processing metric - Handle: {handle}, Value: {value}")
                        
                        data = {
                            "device_id": handle,
                            "timestamp": datetime.now().isoformat(),
                            "metrics": {handle: value}
                        }
                        
                        self._thread_pool.submit(self._handle_device_data_async, data)
                        
                    except Exception as e:
                        logger.error(f"❌ Error processing metric {handle}: {e}")
                        
            except Exception as e:
                logger.error(f"❌ Error in fast metric callback: {e}")

        consumers.on_metric_update = fast_metric_callback
        await asyncio.sleep(0.1)
        
        if hasattr(consumers, 'rebind_callbacks'):
            consumers.rebind_callbacks()
        else:
            logger.warning("⚠️ rebind_callbacks function not available in consumers module")

        await asyncio.sleep(0.1)
        
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, consumers.run_multi_provider_consumer)

    def _handle_device_data_async(self, data: Dict[str, Any]):
        try:
            start_time = time.time()
            
            if 'timestamp' not in data:
                data['timestamp'] = datetime.now(timezone.utc).isoformat()
            
            self.kafka_send(data)
            
            for callback in self._data_callbacks:
                try:
                    callback(data)
                except Exception as e:
                    logger.error(f"❌ Error in data callback: {e}")
            
            processing_time = time.time() - start_time
            logger.debug(f"📤 Data processed in {processing_time:.3f}s: {data}")
            
        except Exception as e:
            logger.error(f"❌ Error in async data handling: {e}")
    
    def _json_serializer(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")
    
    def kafka_send(self, data: Dict[str, Any]):
        try:
            topic = "medical-device-data"
            json_data = json.dumps(data, default=self._json_serializer)
            
            self.producer.produce(topic, json_data.encode('utf-8'))
            
            self.producer.poll(0)
            
            logger.debug(f"✅ Successfully sent data to Kafka topic {topic}")
        except Exception as e:
            logger.error(f"❌ Error sending data to Kafka: {e}")

sdc_consumer_service = MinimalOptimizedSDCConsumerService()