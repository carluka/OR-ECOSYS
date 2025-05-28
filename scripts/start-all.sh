#!/bin/bash

# Zaženi providerje v ozadju
python /app/providers/provider_spo2.py & 
python /app/providers/provider_temperature.py &
python /app/providers/provider_infusion.py &
python /app/providers/provider_ecg.py &
python /app/providers/provider_nibp.py &
python /app/providers/provider_capnograph.py &
python /app/providers/provider_ventilator.py &

# Zaženi FastAPI consumer
exec python /app/sdc_backend/run.py --host 0.0.0.0 --reload
