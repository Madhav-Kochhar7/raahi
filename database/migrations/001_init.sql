-- Users and Auth
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role VARCHAR(20) NOT NULL CHECK (role IN ('passenger', 'rider', 'admin')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    gender VARCHAR(20),
    safety_mode_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emergency_contacts (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relation VARCHAR(50)
);

CREATE TABLE rider_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    vehicle_number VARCHAR(50),
    vehicle_model VARCHAR(100),
    licence_number VARCHAR(100),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    identity_verified BOOLEAN DEFAULT false,
    licence_verified BOOLEAN DEFAULT false,
    vehicle_verified BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT false,
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    rating_avg NUMERIC(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0
);

-- Zones and Schedules
CREATE TABLE zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    radius_m INTEGER NOT NULL,
    type VARCHAR(50) CHECK (type IN ('bus_stand', 'college', 'market', 'hospital', 'industrial', 'residential', 'railway'))
);

CREATE TABLE zone_schedule (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER REFERENCES zones(id),
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
    start_hour TIME,
    end_hour TIME,
    label VARCHAR(100)
);

CREATE TABLE saved_locations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    label VARCHAR(100),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    address TEXT
);

-- Route Pass (Section 18)
CREATE TABLE route_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    from_zone_id INTEGER REFERENCES zones(id),
    to_zone_id INTEGER REFERENCES zones(id),
    from_stop_name VARCHAR(255),
    from_lat DOUBLE PRECISION,
    from_lng DOUBLE PRECISION,
    to_stop_name VARCHAR(255),
    to_lat DOUBLE PRECISION,
    to_lng DOUBLE PRECISION,
    distance_km NUMERIC(5,2),
    duration_min INTEGER,
    route_polyline TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE pass_plans (
    id SERIAL PRIMARY KEY,
    route_template_id INTEGER REFERENCES route_templates(id),
    name VARCHAR(255),
    price NUMERIC(10,2),
    validity_days INTEGER DEFAULT 30,
    trips_included INTEGER DEFAULT 44,
    weekdays INTEGER[], -- array of days e.g. {1,2,3,4,5}
    max_skips INTEGER DEFAULT 4,
    max_pause_days INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE pass_plan_slots (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES pass_plans(id),
    direction VARCHAR(20) CHECK (direction IN ('outbound', 'return')),
    window_start TIME,
    window_end TIME
);

CREATE TABLE passes (
    id SERIAL PRIMARY KEY,
    passenger_id INTEGER REFERENCES users(id),
    plan_id INTEGER REFERENCES pass_plans(id),
    status VARCHAR(20) CHECK (status IN ('pending', 'active', 'paused', 'expired', 'cancelled')),
    start_date DATE,
    end_date DATE,
    trips_remaining INTEGER CHECK (trips_remaining >= 0),
    skips_used INTEGER DEFAULT 0,
    price_paid NUMERIC(10,2),
    payment_status VARCHAR(50) DEFAULT 'simulated_paid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_passes_passenger_status ON passes(passenger_id, status);
CREATE INDEX idx_passes_end_date ON passes(end_date);

-- Routine and Matching (Section 19)
CREATE TABLE detected_routines (
    id SERIAL PRIMARY KEY,
    passenger_id INTEGER REFERENCES users(id),
    pickup_zone_id INTEGER REFERENCES zones(id),
    drop_zone_id INTEGER REFERENCES zones(id),
    weekdays INTEGER[],
    typical_time TIME,
    occurrences INTEGER,
    weeks_observed INTEGER,
    confidence NUMERIC(3,2),
    status VARCHAR(20) CHECK (status IN ('suggested', 'accepted', 'dismissed')),
    consent_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE rider_availability (
    id SERIAL PRIMARY KEY,
    rider_id INTEGER REFERENCES users(id),
    weekday INTEGER CHECK (weekday BETWEEN 0 AND 6),
    start_time TIME,
    end_time TIME
);

CREATE TABLE regular_assignments (
    id SERIAL PRIMARY KEY,
    pass_id INTEGER REFERENCES passes(id),
    slot_id INTEGER REFERENCES pass_plan_slots(id),
    rider_id INTEGER REFERENCES users(id),
    backup_rider_id INTEGER REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('proposed', 'confirmed', 'active', 'ended', 'swapped')),
    match_score NUMERIC(5,2),
    match_breakdown JSONB,
    sticky_since DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_active_assignment UNIQUE (pass_id, slot_id)
);

CREATE TABLE rider_reliability (
    rider_id INTEGER PRIMARY KEY REFERENCES users(id),
    scheduled_trips INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    missed INTEGER DEFAULT 0,
    late INTEGER DEFAULT 0,
    reliability_score NUMERIC(5,2) DEFAULT 100.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE passenger_preferences (
    passenger_id INTEGER PRIMARY KEY REFERENCES users(id),
    min_rider_rating NUMERIC(3,2) DEFAULT 4.0,
    excluded_rider_ids INTEGER[] DEFAULT '{}'
);

-- Scheduled Trips
CREATE TABLE scheduled_trips (
    id SERIAL PRIMARY KEY,
    pass_id INTEGER REFERENCES passes(id),
    assignment_id INTEGER REFERENCES regular_assignments(id),
    service_date DATE,
    slot_id INTEGER REFERENCES pass_plan_slots(id),
    ride_id INTEGER, -- nullable, references rides(id) once created
    status VARCHAR(25) CHECK (status IN ('scheduled', 'rider_confirmed', 'dispatched', 'completed', 'missed_by_rider', 'missed_by_passenger', 'skipped', 'cancelled')),
    CONSTRAINT uq_scheduled_trip UNIQUE(pass_id, slot_id, service_date)
);

-- Rides
CREATE TABLE rides (
    id SERIAL PRIMARY KEY,
    passenger_id INTEGER REFERENCES users(id),
    rider_id INTEGER REFERENCES users(id),
    pickup_lat DOUBLE PRECISION,
    pickup_lng DOUBLE PRECISION,
    pickup_address TEXT,
    drop_lat DOUBLE PRECISION,
    drop_lng DOUBLE PRECISION,
    drop_address TEXT,
    pickup_zone_id INTEGER REFERENCES zones(id),
    drop_zone_id INTEGER REFERENCES zones(id),
    status VARCHAR(20) CHECK (status IN ('requested', 'offered', 'accepted', 'rider_en_route', 'arrived', 'in_progress', 'completed', 'cancelled')),
    base_fare NUMERIC(10,2),
    distance_charge NUMERIC(10,2),
    surge_charge NUMERIC(10,2),
    total_fare NUMERIC(10,2),
    distance_km NUMERIC(5,2),
    commission_amount NUMERIC(10,2),
    payment_method VARCHAR(20),
    route_polyline TEXT,
    otp_pin VARCHAR(10),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    arrived_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancel_reason TEXT,
    safety_mode BOOLEAN DEFAULT false,
    scheduled_trip_id INTEGER REFERENCES scheduled_trips(id),
    is_pass_ride BOOLEAN DEFAULT false,
    rider_payout NUMERIC(10,2)
);

CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_timestamps ON rides(requested_at);
CREATE INDEX idx_rides_zones ON rides(pickup_zone_id);

-- Alter scheduled_trips to add the foreign key to rides now that it exists
ALTER TABLE scheduled_trips ADD CONSTRAINT fk_ride_id FOREIGN KEY (ride_id) REFERENCES rides(id);

CREATE TABLE ride_offers (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(id),
    rider_id INTEGER REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('offered', 'accepted', 'rejected', 'expired')),
    offered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ride_events (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(id),
    type VARCHAR(50),
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(id),
    from_user INTEGER REFERENCES users(id),
    to_user INTEGER REFERENCES users(id),
    stars INTEGER CHECK (stars BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Safety and Reports
CREATE TABLE safety_alerts (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(id),
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(30) CHECK (type IN ('sos', 'deviation', 'missed_checkin', 'report')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(id),
    reported_user_id INTEGER REFERENCES users(id),
    ride_id INTEGER REFERENCES rides(id),
    reason TEXT,
    details TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Demand and ML Data
CREATE TABLE demand_history (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER REFERENCES zones(id),
    hour_start TIMESTAMP WITH TIME ZONE,
    requests INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    cancelled INTEGER DEFAULT 0,
    riders_available INTEGER DEFAULT 0,
    UNIQUE(zone_id, hour_start)
);

CREATE TABLE demand_predictions (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER REFERENCES zones(id),
    target_hour TIMESTAMP WITH TIME ZONE,
    predicted_demand INTEGER,
    demand_level VARCHAR(20) CHECK (demand_level IN ('LOW', 'MEDIUM', 'HIGH')),
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(zone_id, target_hour)
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50),
    title VARCHAR(255),
    body TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
