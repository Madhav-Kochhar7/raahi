from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import json
import os
import random
from datetime import datetime, timedelta

app = FastAPI()

MODEL_PATH = 'model.pkl'
METRICS_PATH = 'metrics.json'

try:
    model = joblib.load(MODEL_PATH)
except Exception:
    model = None

@app.get("/")
def read_root():
    return {"message": "RAAHI Prediction Service"}

@app.get("/predict")
def predict_demand(hour: int, zone: int):
    if model is None:
        return {"error": "Model not trained yet."}
    
    # Very simplified prediction input using dummies for missing fields
    dt = datetime.now().replace(hour=hour)
    day_of_week = dt.weekday()
    is_weekend = int(day_of_week >= 5)
    is_college_hours = int(8 <= hour <= 16 and not is_weekend)
    is_bus_arrival_window = int(hour in [7,8,9,17,18,19,20])
    
    X = pd.DataFrame([{
        'zone_id': zone,
        'hour': hour,
        'day_of_week': day_of_week,
        'is_weekend': is_weekend,
        'is_college_hours': is_college_hours,
        'is_bus_arrival_window': is_bus_arrival_window,
        'req_prev_hour': 2, # dummy
        'req_last_week': 2, # dummy
        'riders_available': 5 # dummy
    }])
    
    pred = max(0, int(model.predict(X)[0]))
    
    level = "LOW"
    if pred > 15:
        level = "HIGH"
    elif pred > 5:
        level = "MEDIUM"
        
    return {
        "zone_id": zone,
        "target_hour": hour,
        "predicted_demand": pred,
        "demand_level": level
    }

@app.get("/hotspots")
def get_hotspots():
    # Returns current hotspots for the rider app
    if model is None:
        return {"error": "Model not trained yet."}
    
    hour = datetime.now().hour
    hotspots = []
    
    for zone in range(1, 9):
        res = predict_demand(hour, zone)
        if "error" not in res:
            res['shortage'] = max(0, res['predicted_demand'] - random.randint(2, 8)) # Simulated shortage
            hotspots.append(res)
            
    return hotspots

@app.get("/metrics")
def get_metrics():
    if not os.path.exists(METRICS_PATH):
        return {"error": "Metrics not found. Run train.py."}
    with open(METRICS_PATH, 'r') as f:
        return json.load(f)

@app.post("/retrain")
def retrain():
    import subprocess
    try:
        subprocess.run(["python", "train.py"], check=True)
        global model
        model = joblib.load(MODEL_PATH)
        return {"message": "Retrained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/routines")
def get_routines(payload: dict):
    try:
        from routines import detect_routines
        rides_df = pd.DataFrame(payload.get('rides', []))
        routines = detect_routines(rides_df)
        return routines
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match")
def match_riders(payload: dict):
    try:
        from matching import assign_riders
        res = assign_riders(payload.get('passengers', []), payload.get('riders', []))
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
