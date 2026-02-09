import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authService from '~/services/auth.service';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'CUSTOMER' | 'ORGANIZER';
    avatar?: string;
    point?: number;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (data: authService.RegisterData) => Promise<void>;
    logout: () => void;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email: string, password: string) => {
                try {
                    set({ isLoading: true });
                    const response = await authService.login({ email, password });

                    // Store token in localStorage
                    localStorage.setItem('auth_token', response.token);

                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            register: async (data: authService.RegisterData) => {
                try {
                    set({ isLoading: true });
                    const response = await authService.register(data);

                    // Store token in localStorage
                    localStorage.setItem('auth_token', response.token);

                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: () => {
                authService.logout();
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },

            setUser: (user: User | null) => {
                set({ user, isAuthenticated: !!user });
            },

            setToken: (token: string | null) => {
                if (token) {
                    localStorage.setItem('auth_token', token);
                } else {
                    localStorage.removeItem('auth_token');
                }
                set({ token });
            },

            checkAuth: async () => {
                const token = localStorage.getItem('auth_token');

                if (!token) {
                    set({ isAuthenticated: false, user: null, token: null });
                    return;
                }

                try {
                    const user = await authService.getMe();
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                    });
                } catch (error) {
                    // Token is invalid
                    localStorage.removeItem('auth_token');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                    });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
