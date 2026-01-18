import axios from "axios";
import { authStore } from "../store/auth.store";

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
    timeout: 15000,
});

http.interceptors.request.use((config) => {
    const token = authStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
