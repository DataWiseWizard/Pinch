// client/src/components/Navbar.jsx

import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';



const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'background.paper' }}> {/* sticky keeps it at top, elevation adds subtle shadow */}
            {/* Toolbar handles padding and alignment */}
            <Toolbar>
                {/* Brand/Logo Link */}
                <Link
                    component={RouterLink}
                    to="/"
                    underline="none"
                    color="inherit" // Inherits text color from AppBar
                    sx={{ display: 'flex', alignItems: 'center', mr: 2 }} // mr: 2 adds margin to the right
                >
                    {/* <CompassIcon sx={{ mr: 1 }} />  Optional Icon */}
                    <Typography variant="h6" component="div">
                        Pinch
                    </Typography>
                </Link>

                {/* Create Button (Visible when logged in) */}
                {currentUser && (
                    <Button
                        color="inherit" // Use AppBar's text color
                        component={RouterLink}
                        to="/pins/new"
                    >
                        Create
                    </Button>
                )}

                {/* Spacer Box to push subsequent items to the right */}
                <Box sx={{ flexGrow: 1 }} />

                {/* Conditional Rendering for Auth Links */}
                {currentUser ? (
                    <>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/profile"
                            sx={{ textTransform: 'none', mr: 1 }} // Keep username capitalization, add margin
                        >
                            {currentUser.username}
                        </Button>
                        <Button
                            color="inherit"
                            variant="outlined" // Make logout visually distinct
                            onClick={handleLogout}
                            sx={{ borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { borderColor: 'white' } }} // Style outline in dark mode
                        >
                            Log Out
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/signup"
                            sx={{ mr: 1 }} // Add margin between buttons
                        >
                            Sign Up
                        </Button>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/login"
                        >
                            Log In
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;