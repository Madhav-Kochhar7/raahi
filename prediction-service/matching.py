import numpy as np
from scipy.optimize import linear_sum_assignment

def assign_riders(passengers, riders):
    """
    passengers: list of dicts with {id, pickup_zone_id, drop_zone_id, min_rider_rating, excluded_rider_ids, prev_rider_id}
    riders: list of dicts with {id, is_verified, active_alerts, rating, base_zone_id, reliability_score, familiar_routes}
    """
    n_p = len(passengers)
    n_r = len(riders)
    
    # Cost matrix (we want to maximize score, so minimize -score)
    # Give a huge cost to invalid matches
    cost_matrix = np.full((n_p, n_r), 1000000.0)
    score_breakdowns = {}
    
    for i, p in enumerate(passengers):
        for j, r in enumerate(riders):
            # Step 1: Hard Constraints
            if not r.get('is_verified', False):
                score_breakdowns[(p['id'], r['id'])] = {"valid": False, "reason": "Not fully verified"}
                continue
            if r.get('active_alerts', 0) > 0:
                score_breakdowns[(p['id'], r['id'])] = {"valid": False, "reason": "Active safety alerts"}
                continue
            if r['id'] in p.get('excluded_rider_ids', []):
                score_breakdowns[(p['id'], r['id'])] = {"valid": False, "reason": "Excluded by passenger"}
                continue
            if r.get('rating', 0) < p.get('min_rider_rating', 4.0):
                score_breakdowns[(p['id'], r['id'])] = {"valid": False, "reason": "Rating too low"}
                continue
                
            # Step 2: Score 0-100
            reliability_score = (r.get('reliability_score', 100) / 100.0) * 30
            rating_score = (r.get('rating', 5.0) / 5.0) * 20
            
            # familiarity (if rider has done this pickup->drop zone route before)
            route_key = f"{p['pickup_zone_id']}_{p['drop_zone_id']}"
            familiarity_score = 15 if route_key in r.get('familiar_routes', []) else 0
            
            proximity_score = 15 if p['pickup_zone_id'] == r.get('base_zone_id', -1) else 0
            
            # Slack/Availability (simplification: base 10)
            availability_score = 10
            
            # Pref (simplification: base 10)
            pref_score = 10
            
            stickiness = 10 if r['id'] == p.get('prev_rider_id', -1) else 0
            
            total_score = reliability_score + rating_score + familiarity_score + proximity_score + availability_score + pref_score + stickiness
            
            cost_matrix[i, j] = -total_score # negative because we minimize cost
            
            score_breakdowns[(p['id'], r['id'])] = {
                "valid": True,
                "total_score": round(total_score, 1),
                "breakdown": {
                    "reliability": round(reliability_score, 1),
                    "rating": round(rating_score, 1),
                    "familiarity": round(familiarity_score, 1),
                    "proximity": proximity_score,
                    "availability": availability_score,
                    "preference": pref_score,
                    "stickiness": stickiness
                }
            }
            
    # Solve Assignment
    row_ind, col_ind = linear_sum_assignment(cost_matrix)
    
    matches = []
    for i, j in zip(row_ind, col_ind):
        p_id = passengers[i]['id']
        r_id = riders[j]['id']
        
        # If the cost is huge, it means it's an invalid match, skip it
        if cost_matrix[i, j] > 10000:
            continue
            
        # Find a backup rider (second best valid rider)
        backup_id = None
        best_backup_cost = 1000000.0
        for cand_j, r in enumerate(riders):
            if cand_j == j:
                continue
            if cost_matrix[i, cand_j] < best_backup_cost:
                best_backup_cost = cost_matrix[i, cand_j]
                backup_id = riders[cand_j]['id']
                
        if best_backup_cost > 10000:
            backup_id = None
            
        matches.append({
            "passenger_id": p_id,
            "primary_rider_id": r_id,
            "backup_rider_id": backup_id,
            "match_score": score_breakdowns[(p_id, r_id)]['total_score'],
            "breakdown": score_breakdowns[(p_id, r_id)]
        })
        
    return {
        "matches": matches,
        "all_scores": [{"passenger_id": k[0], "rider_id": k[1], "details": v} for k,v in score_breakdowns.items()]
    }
