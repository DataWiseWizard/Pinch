import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../apiConfig';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');

            console.log('[GoogleCallback] Token from URL:', token ? 'Present' : 'Missing');

            if (!token) {
                console.error('[GoogleCallback] No token in URL');
                navigate('/login?error=no_token');
                return;
            }

            try {
                // Decode the token to get user info (without verification - backend already verified)
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );

                const decoded = JSON.parse(jsonPayload);
                console.log('[GoogleCallback] Decoded user:', decoded.username);

                // Create user object from decoded token
                const user = {
                    _id: decoded.id,
                    email: decoded.email,
                    username: decoded.username
                };

                // Log in with the token and user data
                login(user, token);

                console.log('[GoogleCallback] Login successful, redirecting to home');
                navigate('/');
            } catch (error) {
                console.error('[GoogleCallback] Error processing token:', error);
                navigate('/login?error=invalid_token');
            }
        };

        handleCallback();
    }, [searchParams, navigate, login]);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            gap: 2
        }}>
            <CircularProgress />
            <Typography variant="body1">Completing Google login...</Typography>
        </Box>
    );
};

export default GoogleCallback;