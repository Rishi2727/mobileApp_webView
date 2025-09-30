const API_BASE_URL = import.meta.env.VITE_BASE_API_URL ?? 'http://localhost:4000/api';

export const endpoints = {
    auth: {
        login: `${API_BASE_URL}/auth/login`,
    },
};