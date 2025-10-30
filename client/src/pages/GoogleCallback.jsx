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
        const token = searchParams.get('token');
        
        if (!token) {
            console.error('No token in URL');
            navigate('/login?error=no_token');
            return;
        }

        // Verify token and get user data
        const verifyAndLogin = async () => {
            try {
                const response = await fetch(`${API_URL}/api/check-auth`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    }
                });
                
                if (response.ok) {
                    const user = await response.json();
                    login(user, token);
                    navigate('/');
                } else {
                    console.error('Token verification failed');
                    navigate('/login?error=invalid_token');
                }
            } catch (error) {
                console.error('Token verification error:', error);
                navigate('/login?error=verification_failed');
            }
        };

        verifyAndLogin();
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