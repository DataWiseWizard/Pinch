import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../apiConfig';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Card, CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
// import Container from '@mui/material/Container';
// import Box from '@mui/material/Box';
// import TextField from '@mui/material/TextField';
// import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';
// import Alert from '@mui/material/Alert';


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
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Sign Up</CardTitle>
                    <CardDescription>
                        Enter your information to create an account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="YourUsername"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                {/* <AlertCircle className="h-4 w-4" /> */}
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}
                
                        <Button type="submit" className="w-full">
                            Sign Up
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </div>
    );

    //old mui way
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
    //                 Sign Up for Pinch
    //             </Typography>

    //             <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}> {/* Increased top margin */}
    //                 <TextField
    //                     margin="normal" // Adds top and bottom margin
    //                     required
    //                     fullWidth
    //                     id="username"
    //                     label="Username"
    //                     name="username"
    //                     autoComplete="username"
    //                     autoFocus // Focus the first field
    //                     value={username}
    //                     onChange={(e) => setUsername(e.target.value)}
    //                 />
    //                 <TextField
    //                     margin="normal"
    //                     required
    //                     fullWidth
    //                     id="email"
    //                     label="Email Address"
    //                     name="email"
    //                     autoComplete="email"
    //                     value={email}
    //                     onChange={(e) => setEmail(e.target.value)}
    //                 />
    //                 <TextField
    //                     margin="normal"
    //                     required
    //                     fullWidth
    //                     name="password"
    //                     label="Password"
    //                     type="password"
    //                     id="password"
    //                     autoComplete="new-password" // Use new-password for signup forms
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
    //                     variant="contained" // Primary button style
    //                     sx={{ mt: 3, mb: 2 }} // Margin top and bottom
    //                 >
    //                     Sign Up
    //                 </Button>
    //             </Box>
    //         </Box>
    //     </Container>
    // );
};

export default SignUpPage;