// File: src/contexts/AuthContext.jsx
// Mengelola status login dan data pengguna secara global.

import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiGetMyProfile } from '../api/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('erp_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            const fetchProfile = async () => {
                try {
                    const res = await apiGetMyProfile();
                    if (!res.ok) throw new Error('Sesi tidak valid');
                    const data = await res.json();
                    setUser(data.data.user);
                } catch (error) {
                    console.error(error);
                    logout();
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = (newToken) => {
        localStorage.setItem('erp_token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('erp_token');
        setToken(null);
        setUser(null);
    };

    const authContextValue = { user, token, login, logout, loading, isAuthenticated: !!token };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};