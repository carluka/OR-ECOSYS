#!/bin/bash

# Zaženi providerje v ozadju
python /app/providers/provider_BPM.py & 
python /app/providers/provider_SPO2.py & 
python /app/providers/provider_NIBP.py &
python /app/providers/provider_Capnograph.py &

# Zaženi FastAPI consumer
exec python /app/sdc_backend/run.py --host 0.0.0.0 --reload
