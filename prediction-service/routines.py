import pandas as pd
from datetime import timedelta

def detect_routines(rides_df):
    """
    Input: DataFrame of completed rides of the last 6 weeks.
    Rule: same pickup zone, drop zone, weekday set, times within +-30m.
    Output: list of dicts with detected routines.
    """
    if rides_df.empty:
        return []
        
    rides_df['requested_at'] = pd.to_datetime(rides_df['requested_at'])
    rides_df['weekday'] = rides_df['requested_at'].dt.dayofweek
    rides_df['hour'] = rides_df['requested_at'].dt.hour
    rides_df['minute'] = rides_df['requested_at'].dt.minute
    rides_df['time_minutes'] = rides_df['hour'] * 60 + rides_df['minute']
    rides_df['week'] = rides_df['requested_at'].dt.isocalendar().week
    
    # We group by passenger, pickup, drop
    groups = rides_df.groupby(['passenger_id', 'pickup_zone_id', 'drop_zone_id'])
    
    routines = []
    
    for (pass_id, pickup_z, drop_z), group in groups:
        if len(group) < 3:
            continue
            
        # Simplified DBSCAN alternative for +-30min: 
        # just bin by hour for demo, or group if std_dev of time is small
        group = group.sort_values('time_minutes')
        
        # very simple clustering: 
        # a cluster is points within 60 minutes of the first point in the cluster
        clusters = []
        current_cluster = []
        cluster_start = None
        
        for _, row in group.iterrows():
            if cluster_start is None:
                cluster_start = row['time_minutes']
                current_cluster.append(row)
            elif row['time_minutes'] - cluster_start <= 60:
                current_cluster.append(row)
            else:
                clusters.append(pd.DataFrame(current_cluster))
                cluster_start = row['time_minutes']
                current_cluster = [row]
        
        if current_cluster:
            clusters.append(pd.DataFrame(current_cluster))
            
        for cl in clusters:
            weeks_observed = cl['week'].nunique()
            occurrences = len(cl)
            
            # Must occur at least 3 times over at least 3 different weeks
            if occurrences >= 3 and weeks_observed >= 3:
                weekdays = cl['weekday'].unique().tolist()
                avg_time = int(cl['time_minutes'].mean())
                typical_time = f"{avg_time // 60:02d}:{avg_time % 60:02d}"
                
                # Confidence: occurrences / expected_occurrences (expected = weeks * len(weekdays))
                expected = weeks_observed * len(weekdays)
                confidence = min(occurrences / expected, 1.0) if expected > 0 else 0
                
                routines.append({
                    "passenger_id": int(pass_id),
                    "pickup_zone_id": int(pickup_z),
                    "drop_zone_id": int(drop_z),
                    "weekdays": weekdays,
                    "typical_time": typical_time,
                    "occurrences": int(occurrences),
                    "weeks_observed": int(weeks_observed),
                    "confidence": float(round(confidence, 2))
                })
                
    return routines

if __name__ == "__main__":
    # Test with generated data
    import os
    if os.path.exists('synthetic_rides.csv'):
        df = pd.read_csv('synthetic_rides.csv')
        res = detect_routines(df)
        print("Detected routines:")
        for r in res:
            print(r)
