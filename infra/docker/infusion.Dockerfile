ARG DEVICE_NAME=default
FROM python:3.10-slim

WORKDIR /app

COPY services/sdc_backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir sdc11073

COPY services/sdc_providers/ ./providers/

CMD ["sh", "-c", "python providers/provider_infusion}.py"]
