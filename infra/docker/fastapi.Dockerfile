# infra/docker/fastapi.Dockerfile
FROM python:3.10-slim

WORKDIR /app

# 1) kopiraj requirements
COPY services/sdc_backend/requirements.txt ./

# 2) namesti vse Python pakete
RUN pip install --no-cache-dir -r requirements.txt

# 3) skopiraj vso kodo aplikacije
COPY services/sdc_backend/ ./

# 4) zaženimo run.py; host/—reload argumente ločimo v array
CMD ["python", "run.py", "--host", "0.0.0.0", "--reload"]
