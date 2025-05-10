FROM python:3.10-slim
WORKDIR /app
COPY fastapi/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY fastapi/ ./
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--reload"]