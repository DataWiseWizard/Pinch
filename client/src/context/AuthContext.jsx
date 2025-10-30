// client/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
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
    const [token, setToken] = useState(localStorage.getItem('authToken'));

    const refreshAccessToken = async () => {
        try {
            const response = await fetch(`${API_URL}/api/refresh`, {
                method: 'POST',
                credentials: 'include', // Send httpOnly cookie
            });

            if (response.ok) {
                const { accessToken } = await response.json();
                setToken(accessToken);
                localStorage.setItem('authToken', accessToken);
                return accessToken;
            } else {
                // Refresh token expired or invalid
                logout();
                return null;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            logout();
            return null;
        }
    };

    // Check if token is expiring and refresh if needed
    const getValidToken = async () => {
        let currentToken = token || localStorage.getItem('authToken');

        if (!currentToken) return null;

        try {
            const decoded = jwtDecode(currentToken);
            const now = Date.now() / 1000;

            // If token expires in less than 5 minutes, refresh it
            if (decoded.exp - now < 300) {
                console.log('[Auth] Token expiring soon, refreshing...');
                const newToken = await refreshAccessToken();
                return newToken || currentToken;
            }

            return currentToken;
        } catch (error) {
            console.error('Token validation error:', error);
            return currentToken;
        }
    };

    // Function to check if a user is already logged in (from a session)
    // useEffect(() => {
    //     const checkLoggedInStatus = async () => {
    //         try {
    //             const response = await fetch(`${API_URL}/api/check-auth`, {
    //                 credentials: 'include',
    //                 headers: {
    //                     'Accept': 'application/json',
    //                     'Content-Type': 'application/json'
    //                 }
    //             });
    //             if (response.ok) {
    //                 const user = await response.json();
    //                 setCurrentUser(user);
    //             } else {
    //                 setCurrentUser(null);
    //             }
    //         } catch (error) {
    //             console.error('Auth check failed:', error);
    //             setCurrentUser(null);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     checkLoggedInStatus();
    // }, []);

    useEffect(() => {
        const checkLoggedInStatus = async () => {
            const storedToken = localStorage.getItem('authToken');

            if (!storedToken) {
                setCurrentUser(null);
                setLoading(false);
                return;
            }

            try {
                const validToken = await getValidToken();

                if (!validToken) {
                    setCurrentUser(null);
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${API_URL}/api/check-auth`, {
                    headers: {
                        'Authorization': `Bearer ${validToken}`,
                        'Accept': 'application/json',
                    }
                });

                if (response.ok) {
                    const user = await response.json();
                    setCurrentUser(user);
                    setToken(validToken);
                } else {
                    localStorage.removeItem('authToken');
                    setCurrentUser(null);
                    setToken(null);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('authToken');
                setCurrentUser(null);
                setToken(null);
            } finally {
                setLoading(false);
            }
        };

        checkLoggedInStatus();
    }, []);

    const login = (userData, authToken) => {
        console.log('[AuthContext] Login called with user:', userData.username);

        setCurrentUser(userData);
        setToken(authToken);
        localStorage.setItem('authToken', authToken);
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
            setToken(null);
            localStorage.removeItem('authToken');
        }
    };

    // Helper to get auth headers with auto-refresh
    const getAuthHeaders = async () => {
        const validToken = await getValidToken();

        if (validToken) {
            return {
                'Authorization': `Bearer ${validToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
        }

        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    };

    const value = {
        currentUser,
        token,
        login,
        logout,
        getAuthHeaders
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};