FROM python:3.10-slim

WORKDIR /app

COPY services/sdc_backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install --no-cache-dir sdc11073

COPY services/sdc_providers/provider_SPO2.py services/sdc_providers/reference_mdib.xml ./

CMD ["python", "provider_SPO2.py"]
