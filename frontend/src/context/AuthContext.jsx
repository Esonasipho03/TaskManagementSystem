import { createContext, useEffect, useState } from "react";
import api from "../api/axios";
import { clearTokens, getToken, saveTokens } from "../api/tokenStorage";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    async function loadUser() {

        const token = getToken("access") || getToken("refresh");

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

    async function login(username, password, rememberMe = false) {

        const res = await api.post("accounts/login/", {
            username,
            password,
            remember_me: rememberMe,
        });

        saveTokens(res.data, rememberMe);

        const me = await api.get("accounts/me/");

        setUser(me.data);

        return me.data; 
    }

    function logout() {

        clearTokens();

        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}