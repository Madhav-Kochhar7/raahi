import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
import joblib
import os

MODEL_PATH = 'model.pkl'
METRICS_PATH = 'metrics.json'

def train_model():
    print("Loading synthetic demand data...")
    if not os.path.exists('synthetic_demand.csv'):
        print("synthetic_demand.csv not found! Run generate_data.py first.")
        return
        
    df = pd.read_csv('synthetic_demand.csv')
    df['hour_start'] = pd.to_datetime(df['hour_start'])
    
    # Feature engineering
    df['hour'] = df['hour_start'].dt.hour
    df['day_of_week'] = df['hour_start'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'] >= 5
    
    # Simple proxies for features described in prompt (since we don't have zone_schedule joined here)
    df['is_college_hours'] = ((df['hour'] >= 8) & (df['hour'] <= 16) & (~df['is_weekend'])).astype(int)
    df['is_bus_arrival_window'] = ((df['hour'].isin([7,8,9,17,18,19,20]))).astype(int)
    
    # Lag features (requests in previous hour, same hour last week)
    df = df.sort_values(by=['zone_id', 'hour_start'])
    df['req_prev_hour'] = df.groupby('zone_id')['requests'].shift(1).fillna(0)
    df['req_last_week'] = df.groupby('zone_id')['requests'].shift(24*7).fillna(0)

    # Features and Target
    features = ['zone_id', 'hour', 'day_of_week', 'is_weekend', 'is_college_hours', 'is_bus_arrival_window', 'req_prev_hour', 'req_last_week', 'riders_available']
    X = df[features]
    y = df['requests']
    
    # Time-based split: last 2 weeks for test
    cutoff = df['hour_start'].max() - pd.Timedelta(weeks=2)
    train_mask = df['hour_start'] < cutoff
    test_mask = df['hour_start'] >= cutoff
    
    X_train, y_train = X[train_mask], y[train_mask]
    X_test, y_test = X[test_mask], y[test_mask]
    
    print("Training GradientBoostingRegressor...")
    model = GradientBoostingRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Predictions
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    
    # Baseline (hour-of-week average from training data)
    df_train = df[train_mask]
    baseline_avgs = df_train.groupby(['zone_id', 'day_of_week', 'hour'])['requests'].mean().reset_index()
    baseline_avgs.rename(columns={'requests': 'baseline_pred'}, inplace=True)
    
    df_test = df[test_mask].merge(baseline_avgs, on=['zone_id', 'day_of_week', 'hour'], how='left')
    df_test['baseline_pred'].fillna(df_train['requests'].mean(), inplace=True)
    
    mae_baseline = mean_absolute_error(df_test['requests'], df_test['baseline_pred'])
    
    print(f"Model MAE: {mae:.2f}")
    print(f"Baseline MAE: {mae_baseline:.2f}")
    
    # Save model and metrics
    joblib.dump(model, MODEL_PATH)
    import json
    with open(METRICS_PATH, 'w') as f:
        json.dump({'mae': mae, 'baseline_mae': mae_baseline, 'improvement': mae_baseline - mae}, f)
        
    print("Model and metrics saved.")

if __name__ == "__main__":
    train_model()
