FROM python:3.10-slim

WORKDIR /app

# 1. Namesti zahteve
COPY services/sdc_backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 2. Kopiraj vse kode (consumer in providerji)
COPY services/sdc_backend /app/sdc_backend
COPY services/sdc_providers /app/providers

# 3. Zaženi skripto, ki bo zagnala vse komponente
COPY scripts/start-all.sh /app/start-all.sh
RUN chmod +x /app/start-all.sh

CMD ["/app/start-all.sh"]
