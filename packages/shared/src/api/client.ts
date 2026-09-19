import axios, { AxiosInstance } from 'axios';

export class ApiClient {
    private client: AxiosInstance;

    constructor(baseURL: string) {
        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to attach token
        this.client.interceptors.request.use((config) => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('raahi_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            return config;
        });
    }

    // Auth
    async login(data: any) {
        const res = await this.client.post('/api/auth/login', data);
        if (typeof window !== 'undefined' && res.data.token) {
            localStorage.setItem('raahi_token', res.data.token);
            localStorage.setItem('raahi_user', JSON.stringify(res.data.user));
        }
        return res.data;
    }

    async register(data: any) {
        const res = await this.client.post('/api/auth/register', data);
        if (typeof window !== 'undefined' && res.data.token) {
            localStorage.setItem('raahi_token', res.data.token);
            localStorage.setItem('raahi_user', JSON.stringify(res.data.user));
        }
        return res.data;
    }

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('raahi_token');
            localStorage.removeItem('raahi_user');
        }
    }

    // Rides
    async requestRide(data: any) { return (await this.client.post('/api/rides/request', data)).data; }
    async acceptRide(rideId: number) { return (await this.client.post(`/api/rides/${rideId}/accept`)).data; }
    async startRide(rideId: number, otp_pin: string) { return (await this.client.post(`/api/rides/${rideId}/start`, { otp_pin })).data; }
    async completeRide(rideId: number) { return (await this.client.post(`/api/rides/${rideId}/complete`)).data; }
    async rateRide(rideId: number, data: any) { return (await this.client.post(`/api/rides/${rideId}/rate`, data)).data; }

    // Passes
    async getPassPlans() { return (await this.client.get('/api/passes/plans')).data; }
    async getMyPasses() { return (await this.client.get('/api/passes/mine')).data; }
    async purchasePass(plan_id: number) { return (await this.client.post('/api/passes/purchase', { plan_id })).data; }
    
    // Demand / Prediction
    async getHotspots() { return (await this.client.get('/api/demand/hotspots')).data; }
    async getMetrics() { return (await this.client.get('/api/demand/metrics')).data; }
}

declare var process: any;
export const api = new ApiClient(process.env.VITE_API_URL || 'http://localhost:5000');
