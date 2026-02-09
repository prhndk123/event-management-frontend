import api from './api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'CUSTOMER' | 'ORGANIZER';
    referralCode?: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: 'CUSTOMER' | 'ORGANIZER';
        avatar?: string;
        point?: number;
    };
}

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

/**
 * Get current user profile
 */
export const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

/**
 * Logout (client-side only, clears token)
 */
export const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
};
