import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_BASE || 'http://localhost:8080/api';

export const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// Response interceptor for global error handling (optional)
api.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
        // You could handle 401 (Unauthorized) here to trigger logout
        if (error.response && error.response.status === 401) {
            // dispatch logout event or similar
            window.dispatchEvent(new Event('auth_error'));
        }
        return Promise.reject(error);
    }
);
