// client/src/pages/LoginPage.jsx

import React, { useState } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import API_URL from "../apiConfig";

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import GoogleIcon from '@mui/icons-material/Google';


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
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                credentials: 'include', // ✅ Add this
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to log in.');
            }

            const data = await response.json();
            login(data.user);
            navigate('/');

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 4 }}> {/* Use Container for layout */}
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Login to Pinch
                </Typography>

                {signupSuccess && (
                    <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
                        Signup successful! Please log in.
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Log In
                    </Button>

                    <Divider sx={{ my: 2 }}>OR</Divider>

                    <Button
                        fullWidth
                        variant="outlined"
                        href={`${API_URL}/auth/google`}
                        startIcon={<GoogleIcon />}
                    >
                        Login with Google
                    </Button>

                </Box>
            </Box>
        </Container>
    );
};

export default LoginPage;