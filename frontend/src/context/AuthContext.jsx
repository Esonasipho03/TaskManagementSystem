import { createContext, useEffect, useState } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    async function loadUser() {

        const token = localStorage.getItem("access");

        if (!token) {
            setLoading(false);
            return;
        }

        try {

            const res = await api.get("accounts/me/");

            setUser(res.data);

        } catch {

            logout();

        }

        setLoading(false);
    }

    async function login(username, password) {

        const res = await api.post("accounts/login/", {
            username,
            password,
        });

        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);

        const me = await api.get("accounts/me/");

        setUser(me.data);
    }

    function logout() {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}