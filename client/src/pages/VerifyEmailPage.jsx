import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API_URL from '../apiConfig';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
// import { LoaderCircle, AlertCircle, CheckCircle } from 'lucide-react';
// import Container from '@mui/material/Container';
// import Box from '@mui/material/Box';
// import CircularProgress from '@mui/material/CircularProgress';
// import Typography from '@mui/material/Typography';
// import Alert from '@mui/material/Alert';
// import Button from '@mui/material/Button';

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
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Email Verification</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {loading && (
                        <div className="flex flex-col items-center gap-4 p-4">
                            {/* <LoaderCircle className="h-10 w-10 animate-spin" /> */}
                            <p className="text-muted-foreground">Verifying your email, please wait...</p>
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            {/* <AlertCircle className="h-4 w-4" /> */}
                            <AlertTitle>Verification Failed</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert variant="default"> {/* 'default' has green accent */}
                            {/* <CheckCircle className="h-4 w-4" /> */}
                            <AlertTitle>Success!</AlertTitle>
                            <AlertDescription>{success} Redirecting you to log in...</AlertDescription>
                        </Alert>
                    )}

                    {!loading && (
                        <Button asChild>
                            <RouterLink to="/login">Go to Login</RouterLink>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
    //old mui way
    // return (
    //     <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
    //         <Box
    //             sx={{
    //                 display: 'flex',
    //                 flexDirection: 'column',
    //                 alignItems: 'center',
    //                 gap: 3,
    //             }}
    //         >
    //             <Typography component="h1" variant="h5">
    //                 Email Verification
    //             </Typography>

    //             {loading && (
    //                 <>
    //                     <CircularProgress />
    //                     <Typography>Verifying your email, please wait...</Typography>
    //                 </>
    //             )}

    //             {error && (
    //                 <Alert severity="error" sx={{ width: '100%' }}>
    //                     {error}
    //                 </Alert>
    //             )}

    //             {success && (
    //                 <Alert severity="success" sx={{ width: '100%' }}>
    //                     {success} Redirecting you to log in...
    //                 </Alert>
    //             )}

    //             {!loading && (
    //                 <Button 
    //                     variant="contained" 
    //                     onClick={() => navigate('/login')}
    //                 >
    //                     Go to Login
    //                 </Button>
    //             )}
    //         </Box>
    //     </Container>
    // );
};

export default VerifyEmailPage;