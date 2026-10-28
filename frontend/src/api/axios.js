import axios from "axios";

import { clearTokens, getToken, setAccessToken } from "./tokenStorage";

const baseURL = `${import.meta.env.VITE_API_URL}/api/`;

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
    const token = getToken("access");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Access tokens are short-lived. When one expires, swap the refresh token
// for a new access token once and retry the request, so "Keep me logged in"
// lasts as long as the refresh token does.
let refreshing = null;

async function refreshAccessToken() {
    const refresh = getToken("refresh");
    if (!refresh) throw new Error("No refresh token");

    const res = await axios.post(`${baseURL}accounts/refresh/`, { refresh });
    setAccessToken(res.data.access);
    return res.data.access;
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const isAuthCall = original?.url?.startsWith("accounts/login") ||
            original?.url?.startsWith("accounts/refresh");

        if (error.response?.status !== 401 || !original || original._retried || isAuthCall) {
            throw error;
        }

        original._retried = true;

        try {
            refreshing = refreshing || refreshAccessToken();
            const access = await refreshing;
            original.headers.Authorization = `Bearer ${access}`;
            return api(original);
        } catch {
            clearTokens();
            throw error;
        } finally {
            refreshing = null;
        }
    }
);

export default api;
