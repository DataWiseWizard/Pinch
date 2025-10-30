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
    const googleError = new URLSearchParams(location.search).get('error');

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
            login(data.user, data.accessToken);
            navigate('/');

        } catch (err) {
            setError(err.message);
        }
    };

    // Handle Google OAuth popup callback
    // useEffect(() => {
    //     const handleMessage = async (event) => {
    //         // Verify message origin
    //         if (event.origin !== API_URL.replace(/\/$/, '')) return;

    //         if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
    //             console.log('Google auth success message received');
    //             // Wait a moment for cookie to be set, then check auth
    //             setTimeout(async () => {
    //                 try {
    //                     const response = await fetch(`${API_URL}/api/check-auth`, {
    //                         credentials: 'include',
    //                         headers: {
    //                             'Accept': 'application/json',
    //                         }
    //                     });

    //                     if (response.ok) {
    //                         const user = await response.json();
    //                         login(user);
    //                         navigate('/');
    //                     } else {
    //                         setError('Authentication successful but session failed. Please try regular login.');
    //                     }
    //                 } catch (err) {
    //                     console.error('Post-auth check failed:', err);
    //                     setError('Failed to verify authentication.');
    //                 }
    //             }, 500);
    //         } else if (event.data.type === 'GOOGLE_AUTH_FAILURE') {
    //             setError('Google authentication failed. Please try again.');
    //         }
    //     };

    //     window.addEventListener('message', handleMessage);
    //     return () => window.removeEventListener('message', handleMessage);
    // }, [login, navigate]);

    const handleGoogleLogin = () => {
        // Redirect to Google OAuth
        window.location.href = `${API_URL}/auth/google`;
        // const width = 500;
        // const height = 600;
        // const left = window.screen.width / 2 - width / 2;
        // const top = window.screen.height / 2 - height / 2;

        // const popup = window.open(
        //     `${API_URL}/auth/google`,
        //     'Google Login',
        //     `width=${width},height=${height},left=${left},top=${top}`
        // );

        // if (!popup) {
        //     setError('Popup blocked! Please allow popups for this site.');
        // }
    };





    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 4 }}>
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

                {googleError && (
                    <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                        Google authentication failed. Please try again.
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
                        onClick={handleGoogleLogin}
                        startIcon={<GoogleIcon />}
                    >
                        Login with Google
                    </Button>
                </Box>
            </Box>
        </Container>
    );
    // return (
    //     <Container component="main" maxWidth="xs" sx={{ mt: 4 }}> {/* Use Container for layout */}
    //         <Box
    //             sx={{
    //                 marginTop: 8,
    //                 display: 'flex',
    //                 flexDirection: 'column',
    //                 alignItems: 'center',
    //             }}
    //         >
    //             <Typography component="h1" variant="h5">
    //                 Login to Pinch
    //             </Typography>

    //             {signupSuccess && (
    //                 <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
    //                     Signup successful! Please log in.
    //                 </Alert>
    //             )}

    //             <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
    //                 <TextField
    //                     margin="normal"
    //                     required
    //                     fullWidth
    //                     id="username"
    //                     label="Username"
    //                     name="username"
    //                     autoComplete="username"
    //                     autoFocus
    //                     value={username}
    //                     onChange={(e) => setUsername(e.target.value)}
    //                 />
    //                 <TextField
    //                     margin="normal"
    //                     required
    //                     fullWidth
    //                     name="password"
    //                     label="Password"
    //                     type="password"
    //                     id="password"
    //                     autoComplete="current-password"
    //                     value={password}
    //                     onChange={(e) => setPassword(e.target.value)}
    //                 />

    //                 {error && (
    //                     <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
    //                         {error}
    //                     </Alert>
    //                 )}

    //                 <Button
    //                     type="submit"
    //                     fullWidth
    //                     variant="contained"
    //                     sx={{ mt: 3, mb: 2 }}
    //                 >
    //                     Log In
    //                 </Button>

    //                 <Divider sx={{ my: 2 }}>OR</Divider>

    //                 <Button
    //                     fullWidth
    //                     variant="outlined"
    //                     href={`${API_URL}/auth/google`}
    //                     startIcon={<GoogleIcon />}
    //                 >
    //                     Login with Google
    //                 </Button>

    //             </Box>
    //         </Box>
    //     </Container>
    // );
};

export default LoginPage;