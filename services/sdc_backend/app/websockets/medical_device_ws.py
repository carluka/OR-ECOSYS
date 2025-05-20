from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Any
import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class MedicalDeviceWebSocket:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            
    async def broadcast_data(self, data: Dict[str, Any]):
        if not self.active_connections:
            return
            
        if "timestamp" not in data:
            data["timestamp"] = datetime.now().isoformat()
        
        json_data = json.dumps(data)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json_data)
            except WebSocketDisconnect:
                disconnected.append(connection)
            except Exception as e:
                logger.error(f"Error sending data to WebSocket: {e}")
                disconnected.append(connection)
                
        for connection in disconnected:
            self.disconnect(connection)

medical_device_ws = MedicalDeviceWebSocket() 