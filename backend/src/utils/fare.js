// Haversine distance formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}
  
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Fare formula: total = base fare + distance charge + optional surge line
function calculateFare(distanceKm, surgeMultiplier = 1.0) {
    const baseFare = 30.00;
    const perKmRate = 10.00;
    const minimumFare = 40.00;
    
    let distanceCharge = distanceKm * perKmRate;
    let total = baseFare + distanceCharge;
    
    if (total < minimumFare) {
        total = minimumFare;
        distanceCharge = minimumFare - baseFare; // adjust distance charge to meet min fare if necessary
    }
    
    let surgeCharge = 0;
    if (surgeMultiplier > 1.0) {
        // Capped at 1.25
        const actualMultiplier = Math.min(surgeMultiplier, 1.25);
        surgeCharge = total * (actualMultiplier - 1);
        total += surgeCharge;
    }
    
    return {
        baseFare: parseFloat(baseFare.toFixed(2)),
        distanceCharge: parseFloat(distanceCharge.toFixed(2)),
        surgeCharge: parseFloat(surgeCharge.toFixed(2)),
        totalFare: parseFloat(total.toFixed(2)),
        distanceKm: parseFloat(distanceKm.toFixed(2))
    };
}

module.exports = { getDistanceFromLatLonInKm, calculateFare };
