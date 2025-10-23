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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const ProfilePage = () => {
    const { currentUser } = useAuth();
    const [createdPins, setCreatedPins] = useState([]);
    const [savedPins, setSavedPins] = useState([]);
    const [savedPinIds, setSavedPinIds] = useState(new Set()); // Keep track of saved IDs
    const [loadingCreated, setLoadingCreated] = useState(true);
    const [loadingSaved, setLoadingSaved] = useState(true);
    const [error, setError] = useState(null); // General error for fetching
    const [deleteError, setDeleteError] = useState(null);
    const [saveError, setSaveError] = useState(null); // Error for saving actions
    const [currentTab, setCurrentTab] = useState(0);

    const fetchCreatedPins = useCallback(async () => {
        if (!currentUser) return;
        setLoadingCreated(true);
        setError(null);
        try {
            const response = await fetch(`/pins/user/${currentUser._id}`);
            if (!response.ok) throw new Error('Could not fetch created pins.');
            const data = await response.json();
            setCreatedPins(data);
        } catch (err) { setError(err.message); }
        finally { setLoadingCreated(false); }
    }, [currentUser]);

    // --- Fetch Saved Pins ---
    const fetchSavedPins = useCallback(async () => {
        if (!currentUser) return;
        setLoadingSaved(true);
        setError(null); // Clear general error
        try {
            const response = await fetch(`/pins/saved`); // Use the new endpoint
            if (!response.ok) throw new Error('Could not fetch saved pins.');
            const data = await response.json();
            setSavedPins(data);
            setSavedPinIds(new Set(data.map(pin => pin._id))); // Update the Set of saved IDs
        } catch (err) { setError(err.message); }
        finally { setLoadingSaved(false); }
    }, [currentUser]);

    // Initial fetch for both
    useEffect(() => {
        fetchCreatedPins();
        fetchSavedPins();
    }, [fetchCreatedPins, fetchSavedPins]); // Depend on the memoized functions


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

    const handleSavePin = async (pinId, shouldSave) => {
        // ... (same save/unsave logic as in PinList, but updates savedPins/savedPinIds state)
        if (!currentUser) { setSaveError("You must be logged in."); return; }
        setSaveError(null);
        const originalSavedPinIds = new Set(savedPinIds); // Store for potential revert

        // Optimistic UI update for immediate feedback
        setSavedPinIds(prevIds => {
            const newIds = new Set(prevIds);
            if (shouldSave) newIds.add(pinId); else newIds.delete(pinId);
            return newIds;
        });
        // Also update savedPins array optimistically if showing saved tab
        if (!shouldSave && currentTab === 1) {
            setSavedPins(prevPins => prevPins.filter(p => p._id !== pinId));
        }


        try {
            const response = await fetch(`/pins/${pinId}/save`, { method: 'PUT' });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to ${shouldSave ? 'save' : 'unsave'} pin.`);
            }
            const result = await response.json();
            // Sync state with backend response (important if optimistic differs or failed)
            setSavedPinIds(new Set(result.savedPins || []));
            // Re-fetch saved pins if the tab is active to ensure full data consistency
            if (currentTab === 1) fetchSavedPins();

        } catch (err) {
            console.error("Error saving/unsaving pin:", err);
            setSaveError(err.message);
            // Revert optimistic updates on error
            setSavedPinIds(originalSavedPinIds);
            if (!shouldSave && currentTab === 1) fetchSavedPins(); // Re-fetch if unsave failed on saved tab
        }
    };

    // --- Tab Handling ---
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
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

    const renderContent = () => {
        const isLoading = currentTab === 0 ? loadingCreated : loadingSaved;
        const pinsToDisplay = currentTab === 0 ? createdPins : savedPins;

        if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
        // Show general fetch error if present
        if (error && pinsToDisplay.length === 0) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

        if (pinsToDisplay.length > 0) {
            return (
                <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
                    {pinsToDisplay.map(pin => (
                        <div key={pin._id}>
                            <Pin
                                pin={pin}
                                // Pass onDelete only for the "Created" tab
                                onDelete={currentTab === 0 ? handleDeletePin : null}
                                // Pass onSave for both tabs (to allow unsaving from "Saved" tab)
                                onSave={handleSavePin}
                                // Check saved status against the savedPinIds Set
                                isSaved={savedPinIds.has(pin._id)}
                            />
                        </div>
                    ))}
                </Masonry>
            );
        }
        return <Typography sx={{ mt: 4, textAlign: 'center' }}>
            {currentTab === 0 ? "You haven't created any pins yet." : "You haven't saved any pins yet."}
         </Typography>;
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

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange} centered>
                    <Tab label="Created" />
                    <Tab label="Saved" />
                </Tabs>
            </Box>
             {/* Display errors specific to actions */}
             {deleteError && currentTab === 0 && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
             {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}


            {renderContent()}
        </Container>
    );
};

export default ProfilePage;