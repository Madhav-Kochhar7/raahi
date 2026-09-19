# RAAHI

**RAAHI** is a scalable, ML-driven transit routing and automated matching platform designed for the Next-Gen College Transit System.

## Architecture

- **Backend (`/backend`)**: Node.js/Express with PostgreSQL (via `pg`). Handles core business logic, pass subscription billing logic, role-based authentication (JWT), matching execution, and Socket.IO real-time GPS tracking.
- **Prediction Service (`/prediction-service`)**: Python/FastAPI using `scikit-learn`, `pandas`, and `scipy.optimize`. Handles ML demand forecasting, recurring pattern mining (`routines.py`), and a global bipartite graph optimizer for rider-to-passenger assignment (`matching.py`).
- **Shared Package (`/packages/shared`)**: A pure React/TypeScript UI kit utilizing CSS variables for a sleek, cyberpunk, dark-mode UI. Contains reusable components (`Button`, `Card`, `Badge`, `MapView`) and an Axios API client wrapper.
- **Rider App (`/apps/rider`)**: Vite React PWA for verified auto-rickshaw riders. Features include online/offline toggling, heatmap overlay of predicted demand, automatic assignments via ML scheduling, and ride lifecycle management with OTP verification.
- **Passenger App (`/apps/passenger`)**: Vite React PWA for students/commuters. Features include ad-hoc ride requests, commute pass subscriptions (regular rider trust toggle), AI Chat assistant, and a Safety Center (SOS/Secure Recording).
- **Admin App (`/apps/admin`)**: Vite React web dashboard for operators to visualize ML demand metrics (Recharts), invoke OpenAI for data explanations, and control the demo via time-travel (triggering nightly cron jobs dynamically).

## Features

- **Global Rider Optimization**: Instead of greedy "nearest-driver" matching, RAAHI uses the Hungarian Algorithm to find the mathematically optimal global assignment of riders to passengers based on reliability, user rating, route familiarity, and stated preferences.
- **Predictive Heatmaps**: Ingests historical data into a GradientBoostingRegressor to forecast zone-by-zone demand, rendering hot zones directly on the Rider app.
- **Commute Passes (Recurring Demand)**: Users can buy monthly passes. A nightly cron job extracts routines and auto-generates trips for the next day, pre-assigning verified drivers to pass-holders.
- **Safety First**: Implements an SOS broadcast feature and an encrypted "Safety Mode" audio recording overlay.

## Running Locally

1. Create a PostgreSQL database and configure `.env` in the backend.
2. Run database migrations: `npm run migrate` in `/backend`.
3. Generate synthetic ML data: `cd prediction-service && ./venv/bin/python generate_data.py`.
4. Train the ML models: `cd prediction-service && ./venv/bin/python train_model.py`.
5. Start the Prediction Service: `cd prediction-service && uvicorn app:app --reload`.
6. Start the Backend: `cd backend && npm start`.
7. Build the UI Kit: `cd packages/shared && npm run build`.
8. Run any frontend app: `cd apps/<app-name> && npm run dev`.

## The Demo Hook

For hackathon presentation purposes, RAAHI ships with an Admin dashboard that allows you to bypass the need to wait for real-world time. You can:
1. Hit **Fast-Forward Clock** to trigger the 20:00 schedule generator, instantly assigning riders for the next day.
2. Hit **Dispatch Trip** to force the assignment engine to broadcast the ride to the Rider App immediately.
