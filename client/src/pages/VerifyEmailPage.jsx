import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API_URL from '../apiConfig';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const token = searchParams.get('token');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError("No verification token found. Please check your link.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/verify-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Verification failed.');
                }

                setSuccess(data.message);
                
                // Redirect to login after a short delay
                setTimeout(() => {
                    navigate('/login?verification=success');
                }, 3000);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token, navigate]);

    return (
        <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                }}
            >
                <Typography component="h1" variant="h5">
                    Email Verification
                </Typography>

                {loading && (
                    <>
                        <CircularProgress />
                        <Typography>Verifying your email, please wait...</Typography>
                    </>
                )}

                {error && (
                    <Alert severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ width: '100%' }}>
                        {success} Redirecting you to log in...
                    </Alert>
                )}

                {!loading && (
                    <Button 
                        variant="contained" 
                        onClick={() => navigate('/login')}
                    >
                        Go to Login
                    </Button>
                )}
            </Box>
        </Container>
    );
};

export default VerifyEmailPage;