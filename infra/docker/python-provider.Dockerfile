ARG DEVICE_NAME=default
FROM python:3.10-slim

WORKDIR /app

COPY services/sdc_backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir sdc11073

COPY services/sdc_providers/ ./providers/

ARG DEVICE_NAME
ENV DEVICE_NAME=${DEVICE_NAME}

CMD ["sh", "-c", "python providers/provider_${DEVICE_NAME}.py"]
