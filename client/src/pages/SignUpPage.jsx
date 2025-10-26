// client/src/pages/SignupPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../apiConfig';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';


const SignUpPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to sign up.');
            }
            
            // Redirect to login page with a success message
            navigate('/login?signup=success');

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
                    Sign Up for Pinch
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}> {/* Increased top margin */}
                    <TextField
                        margin="normal" // Adds top and bottom margin
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus // Focus the first field
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password" // Use new-password for signup forms
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
                        variant="contained" // Primary button style
                        sx={{ mt: 3, mb: 2 }} // Margin top and bottom
                    >
                        Sign Up
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default SignUpPage;