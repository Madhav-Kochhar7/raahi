import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# For connecting to DB if needed, but we'll print SQL for now to be safe if DB is down.
# Or if you want to execute directly, we can use psycopg2.

def generate_synthetic_data():
    np.random.seed(42)
    random.seed(42)
    
    # 8 weeks of data
    end_date = datetime.now()
    start_date = end_date - timedelta(weeks=8)
    
    zones = [
        (1, 'Central Bus Stand'),
        (2, 'Railway Station'),
        (3, 'College Road'),
        (4, 'Main Market'),
        (5, 'Model Town'),
        (6, 'Civil Hospital'),
        (7, 'Industrial Area'),
        (8, 'Residential Area')
    ]
    
    # We will generate demand_history records directly.
    # We need an hourly frequency.
    date_rng = pd.date_range(start=start_date, end=end_date, freq='h')
    
    records = []
    
    for dt in date_rng:
        day_of_week = dt.weekday()
        hour = dt.hour
        
        for zone_id, zone_name in zones:
            base_requests = random.randint(0, 5)
            
            # Bus Stand peaks
            if zone_id == 1 and (7 <= hour <= 9 or 17 <= hour <= 20):
                base_requests += random.randint(15, 30)
                
            # College Road peaks
            if zone_id == 3 and day_of_week < 5 and (8 <= hour <= 10 or 15 <= hour <= 17):
                base_requests += random.randint(10, 25)
                
            # Market peaks
            if zone_id == 4 and (11 <= hour <= 13 or 18 <= hour <= 21):
                base_requests += random.randint(10, 20)
                
            completed = int(base_requests * random.uniform(0.7, 0.9))
            cancelled = base_requests - completed
            available = max(completed, random.randint(5, 15))
            
            records.append({
                'zone_id': zone_id,
                'hour_start': dt,
                'requests': base_requests,
                'completed': completed,
                'cancelled': cancelled,
                'riders_available': available
            })
            
    df = pd.DataFrame(records)
    print(f"Generated {len(df)} demand history records.")
    
    # Generate 1500+ rides
    rides = []
    # Seeded routine for passenger@demo.com (id=1)
    # 9 past rides on weekdays, Model Town -> College Road around 8:10 to 8:25
    routine_days = [dt for dt in date_rng if dt.weekday() < 5 and dt.hour == 8]
    sampled_days = random.sample(routine_days, 9)
    for sd in sampled_days:
        pickup_time = sd.replace(minute=random.randint(10, 25))
        rides.append({
            'passenger_id': 1,
            'rider_id': 2, # rider@demo.com
            'pickup_lat': 30.4805, 'pickup_lng': 76.5885, 'pickup_address': 'Model Town Gate',
            'drop_lat': 30.4905, 'drop_lng': 76.5855, 'drop_address': 'College Main Gate',
            'pickup_zone_id': 5, # Model Town
            'drop_zone_id': 3, # College Road
            'status': 'completed',
            'base_fare': 30.00, 'distance_charge': 35.00, 'surge_charge': 0.00, 'total_fare': 65.00,
            'distance_km': 3.5, 'commission_amount': 7.80, 'payment_method': 'simulated_upi',
            'requested_at': pickup_time,
            'completed_at': pickup_time + timedelta(minutes=12)
        })
    
    # Remaining rides for training
    for _ in range(1500):
        # random valid pickup time
        dt = random.choice(date_rng)
        zone_id = random.choice(zones)[0]
        rides.append({
            'passenger_id': 1, # Just assign to demo passenger or a random id
            'rider_id': random.randint(2, 9),
            'pickup_lat': 30.48, 'pickup_lng': 76.59, 'pickup_address': 'Random Pick',
            'drop_lat': 30.49, 'drop_lng': 76.60, 'drop_address': 'Random Drop',
            'pickup_zone_id': zone_id,
            'drop_zone_id': random.choice([1,2,3,4,5,6,7,8]),
            'status': 'completed',
            'base_fare': 30.00, 'distance_charge': 15.00, 'surge_charge': 0.00, 'total_fare': 45.00,
            'distance_km': 1.5, 'commission_amount': 5.40, 'payment_method': 'cash',
            'requested_at': dt,
            'completed_at': dt + timedelta(minutes=random.randint(5, 20))
        })
    
    print(f"Generated {len(rides)} synthetic rides.")
    
    db_url = os.environ.get("DATABASE_URL")
    if db_url:
        db_url = db_url.strip('"').strip("'")
        print("Connecting to DB to insert records...")
        from sqlalchemy import create_engine
        # Ensure url format for sqlalchemy: postgresql://...
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
            
        try:
            engine = create_engine(db_url)
            df.to_sql('demand_history', engine, if_exists='append', index=False)
            pd.DataFrame(rides).to_sql('rides', engine, if_exists='append', index=False)
            print("Successfully inserted synthetic data into database.")
        except Exception as e:
            print(f"Failed to insert into database: {e}")
            print("Falling back to CSV...")
            df.to_csv('synthetic_demand.csv', index=False)
            pd.DataFrame(rides).to_csv('synthetic_rides.csv', index=False)
    else:
        df.to_csv('synthetic_demand.csv', index=False)
        pd.DataFrame(rides).to_csv('synthetic_rides.csv', index=False)
        print("Saved to CSV. Set DATABASE_URL env var to insert to DB.")

if __name__ == "__main__":
    generate_synthetic_data()
