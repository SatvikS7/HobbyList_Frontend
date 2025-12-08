import { api } from './api';
import { type AuthResponse } from '../types';

export const authService = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', { email, password });
        return response.data;
    },

    signup: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/signup', { email, password });
        return response.data;
    },

    verify: async (token: string): Promise<void> => {
        await api.get(`/auth/verify?token=${token}`);
    },
};
