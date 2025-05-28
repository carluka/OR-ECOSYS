from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Any
import logging
import json
import time
import asyncio
from datetime import datetime
 
logger = logging.getLogger(__name__)
 
class MedicalDeviceWebSocket:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self._send_queue = asyncio.Queue()
        self._sender_task = None
        
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"📱 WebSocket connected. Total connections: {len(self.active_connections)}")
        
        if self._sender_task is None or self._sender_task.done():
            self._sender_task = asyncio.create_task(self._sender_worker())
        
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"📱 WebSocket disconnected. Total connections: {len(self.active_connections)}")
            
    async def broadcast_data(self, data: Dict[str, Any]):
        if not self.active_connections:
            return
            
        ws_timestamp = time.time()
        data["ws_timestamp"] = ws_timestamp
        data["ws_time_iso"] = datetime.now().isoformat()
        
        try:
            self._send_queue.put_nowait(data)
        except asyncio.QueueFull:
            logger.warning("📡 WebSocket send queue full, dropping message")
    
    async def _sender_worker(self):
        while True:
            try:
                data = await self._send_queue.get()
                
                if "timestamp" not in data:
                    data["timestamp"] = datetime.now().isoformat()
                
                json_data = json.dumps(data)
                disconnected = []
                
                send_tasks = []
                for connection in self.active_connections:
                    task = asyncio.create_task(self._send_to_connection(connection, json_data))
                    send_tasks.append((connection, task))
                
                for connection, task in send_tasks:
                    try:
                        await asyncio.wait_for(task, timeout=0.1)  
                    except (asyncio.TimeoutError, WebSocketDisconnect, Exception) as e:
                        logger.debug(f"📡 Failed to send to connection: {e}")
                        disconnected.append(connection)
                
                for connection in disconnected:
                    self.disconnect(connection)
                
                self._send_queue.task_done()
                
            except Exception as e:
                logger.error(f"❌ Error in WebSocket sender worker: {e}")
                await asyncio.sleep(0.1)
    
    async def _send_to_connection(self, connection: WebSocket, data: str):
        try:
            await connection.send_text(data)
        except WebSocketDisconnect:
            raise
        except Exception as e:
            logger.debug(f"📡 Error sending to WebSocket connection: {e}")
            raise
 
medical_device_ws = MedicalDeviceWebSocket()