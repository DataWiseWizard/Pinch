import React, { useState, useEffect, useCallback } from 'react';
import Masonry from '@mui/lab/Masonry';
import { useAuth } from '../context/AuthContext';
import Pin from '../components/Pin';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';


const ProfilePage = () => {
    const { currentUser } = useAuth();
    const [userPins, setUserPins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

    const fetchUserPins = useCallback(async () => {
        if (!currentUser) return;

        setLoading(true);
        setError(null);
        setDeleteError(null);
        try {
            const response = await fetch(`/pins/user/${currentUser._id}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Could not fetch user pins.');
            }
            const data = await response.json();
            setUserPins(data);
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchUserPins();
    }, [fetchUserPins]);

    const handleDeletePin = async (pinIdToDelete) => {
        setDeleteError(null);
        
        const originalPins = [...userPins]; 
        setUserPins(currentPins => currentPins.filter(pin => pin._id !== pinIdToDelete));

        try {
            const response = await fetch(`/pins/${pinIdToDelete}`, {
                method: 'DELETE',
                // headers: { /* Auth headers if needed */ },
            });

            
            if (!response.ok) {
                
                let errorMsg = `HTTP error! status: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg; 
                } catch (jsonError) {
                    console.error("Could not parse error response as JSON:", jsonError);
                }
                throw new Error(errorMsg);
            }

            
             setUserPins(currentPins => currentPins.filter(pin => pin._id !== pinIdToDelete));
            

            
            try {
                 const data = await response.json(); 
                 console.log(data.message || 'Deletion successful'); 
            } catch (e) {
                 console.log('Deletion successful (no response body or not JSON)');
            }


        } catch (err) {
            console.error("Error deleting pin:", err);
            setDeleteError(err.message || "Could not delete pin. Please try again.");
            setUserPins(originalPins);
        }
    };

    if (!currentUser && loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    
    if (!currentUser) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="warning">Please log in to view your profile.</Alert>
            </Container>
        );
    }

    const renderPinContent = () => {
        if (loading && userPins.length === 0) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }
        if (error) {
            return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
        }
        if (userPins.length > 0) {
            return (
                <Masonry
                    columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} 
                    spacing={2} 
                >
                    {userPins.map(pin => (
                        <div key={pin._id}>
                            
                            <Pin pin={pin} onDelete={handleDeletePin} />
                        </div>
                    ))}
                </Masonry>
            );
        }
        return <Typography sx={{ mt: 2, textAlign: 'center' }}>You haven't created any pins yet.</Typography>;
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}> 
            {/* Profile Header */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 4, 
                }}
            >
                <Avatar
                    alt={currentUser.username}
                    src={currentUser.profileImage || '/broken-image.jpg'} 
                    sx={{ width: 120, height: 120, mb: 2 }} 
                />
                <Typography variant="h4" component="h1">
                    {currentUser.username}
                </Typography>
                {/* Optional: Add email or other details if available */}
                <Typography variant="body1" color="text.secondary">
                    {currentUser.email}
                </Typography>
            </Box>

            {/* User Pins Section */}
            <Typography variant="h5" component="h2" gutterBottom align="center">
                Your Pins
            </Typography>

            {deleteError && (
                <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>
            )}

            {renderPinContent()}
        </Container>
    );
};

export default ProfilePage;