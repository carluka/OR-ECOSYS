from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
import pathlib
from fastapi.responses import RedirectResponse

from app.services.sdc_consumer_service import sdc_consumer_service
from app.websockets.medical_device_ws import medical_device_ws


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_main_loop = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global _main_loop
    _main_loop = asyncio.get_running_loop()
    await sdc_consumer_service.start()

    def forward_to_websocket(data: Dict):
        asyncio.run_coroutine_threadsafe(
            medical_device_ws.broadcast_data(data),
            _main_loop
        )

    sdc_consumer_service.add_data_callback(forward_to_websocket)

    yield

    await sdc_consumer_service.stop()

app = FastAPI(
    title="SDC Medical Device API",
    description="API for medical device data from SDC protocol to Frontend in real-time",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=pathlib.Path(__file__).parent.parent / "static"), name="static")


@app.get("/")
async def root():
    return RedirectResponse(url="/static/prikaz.html")

@app.websocket("/ws/medical-device")
async def websocket_endpoint(websocket: WebSocket):
    await medical_device_ws.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        medical_device_ws.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        medical_device_ws.disconnect(websocket)

