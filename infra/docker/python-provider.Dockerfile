ARG DEVICE_NAME=default_device
 
FROM python:3.10-slim
 
WORKDIR /app
 
COPY services/sdc_backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt


COPY ./services/sdc_providers/provider_${DEVICE_NAME}.py ./providers/provider_${DEVICE_NAME}.py
 
# Nastavite okolje, copy ostalih datotek, instalirajte dependencies, itd.
 
CMD ["python", "providers/provider_${DEVICE_NAME}.py"]
