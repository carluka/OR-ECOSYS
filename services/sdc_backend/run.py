import time
import uvicorn
import os

PORT = os.getenv("PORT")
print(PORT)

if __name__ == "__main__":
    time.sleep(15)
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(PORT),
        reload=True
    ) 