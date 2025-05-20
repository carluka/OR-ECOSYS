import time
import uvicorn


if __name__ == "__main__":
    time.sleep(15)
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 