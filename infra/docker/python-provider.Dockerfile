FROM python:3.10-slim

WORKDIR /app

# recimo da imaš isti requirements za vse providerje
COPY services/sdc_backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
