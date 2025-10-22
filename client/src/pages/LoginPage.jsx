// client/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check for a success message from the signup page
    const signupSuccess = new URLSearchParams(location.search).get('signup') === 'success';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to log in.');
            }
            login(data.user)
            navigate('/');

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className='form-container'>
            <h2>Login to Pinch</h2>
            {signupSuccess && <p style={{ color: 'green' }}>Signup successful! Please log in.</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Log In</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <p>OR</p>
                {/* This is a simple link to your backend Google auth route */}
                <a href="http://localhost:5000/auth/google" role="button" style={{ textDecoration: 'none', color: 'white', backgroundColor: '#db4437', padding: '10px 15px', borderRadius: '4px' }}>
                    Login with Google
                </a>
            </div>

        </div>
    );
};

export default LoginPage;