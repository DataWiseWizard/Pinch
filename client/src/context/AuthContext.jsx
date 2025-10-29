// client/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import API_URL from '../apiConfig';

// 1. Create the context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // To handle initial check

    // Function to check if a user is already logged in (from a session)
    useEffect(() => {
        const checkLoggedInStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/api/check-auth`, {
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const user = await response.json();
                    setCurrentUser(user);
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkLoggedInStatus();
    }, []);

    const login = (userData) => {
        setCurrentUser(userData);
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'GET',
                credentials: 'include' // ✅ Add this
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setCurrentUser(null);
        }
    };

    const value = {
        currentUser,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};