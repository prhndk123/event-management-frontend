import axios, { AxiosError } from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('auth_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401) {
            // Clear auth data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');

            // Redirect to login page
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            }
        }

        // Handle 403 Forbidden - insufficient permissions
        if (error.response?.status === 403) {
            console.error('Access forbidden:', error.response.data);
        }

        return Promise.reject(error);
    }
);

export default api;
