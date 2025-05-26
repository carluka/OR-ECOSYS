from typing import Callable, Dict, Any
import asyncio
import logging
from datetime import datetime
from decimal import Decimal
import json
from confluent_kafka import Producer

from app.services import consumers

logger = logging.getLogger(__name__)
producer = Producer({'bootstrap.servers': '127.0.0.1:9092'})

class SDCConsumerService:
    def __init__(self):
        self._consumer_task: asyncio.Task | None = None
        self._is_running = False
        self._data_callbacks: list[Callable[[Dict[str, Any]], None]] = []

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

    async def _run(self):
        def metric_callback(metrics_by_handle: dict):
            for handle, metric in metrics_by_handle.items():
                value = metric.MetricValue.Value if metric.MetricValue else None
                if isinstance(value, Decimal):
                    value = float(value)
                data = {
                    "device_id": handle,
                    "timestamp": datetime.now().isoformat(),
                    "metrics": {handle: value}
                }
                self._handle_device_data(data)

        consumers.on_metric_update = metric_callback

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, consumers.run_multi_provider_consumer)

    def _handle_device_data(self, data: Dict[str, Any]):
        if 'timestamp' not in data:
            data['timestamp'] = datetime.now().isoformat()
        
        # Pošiljanje podatkov v Kafko
        self.kafka_send(data)
        

        for callback in self._data_callbacks:
            try:
                callback(data)
            except Exception as e:
                logger.error(f"Error in data callback: {e}")
    
    def _json_serializer(self, obj):
        """Pomožna funkcija za serializacijo posebnih tipov v JSON."""
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")
    
    def kafka_send(self, data: Dict[str, Any]):
        """Pošlje podatke v Kafka temo."""
        try:
            #TOPIC V KAFKI
            topic = "medical-device-data"
    
            json_data = json.dumps(data, default=self._json_serializer)
        
            producer.produce(topic, json_data.encode('utf-8'))
            producer.flush(timeout=1.0)
            
            logger.debug(f"Successfully sent data to Kafka topic {topic}")
        except Exception as e:
            logger.error(f"Error sending data to Kafka: {e}")

sdc_consumer_service = SDCConsumerService()