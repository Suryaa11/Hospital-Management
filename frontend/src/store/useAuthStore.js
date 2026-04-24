import { create } from 'zustand';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api' // Points to Gateway
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,

    login: async (email, password) => {
        set({ loading: true });
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, ...userData } = res.data;
            localStorage.setItem('token', token);
            set({ user: userData, token, isAuthenticated: true, loading: false });
            return { success: true, isFirstLogin: userData.isFirstLogin, role: userData.role };
        } catch (error) {
            set({ loading: false });
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    },

    register: async (data) => {
        set({ loading: true });
        try {
            await api.post('/users/patient', data);
            set({ loading: false });
            return { success: true };
        } catch (error) {
            set({ loading: false });
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await api.get('/auth/validate');
            set({ user: res.data.user, isAuthenticated: true });
        } catch (error) {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false });
        }
    }
}));

export { useAuthStore, api };
