// client/src/components/PinList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import Pin from './Pin';
import API_URL from '../apiConfig';

import Masonry from '@mui/lab/Masonry';
import Box from '@mui/material/Box';
import { useAuth } from '../context/AuthContext';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

const PinList = () => {
    const { currentUser } = useAuth();
    const [pins, setPins] = useState([]);
    const [savedPinIds, setSavedPinIds] = useState(new Set()); // Use a Set for efficient lookups
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveError, setSaveError] = useState(null);

    const fetchSavedPinsData = useCallback(async () => {
        if (!currentUser) {
            setSavedPinIds(new Set());
            return;
        }
        try {
            const savedResponse = await fetch(`${API_URL}/pins/saved`);
            if (!savedResponse.ok) {
                // Try to get error message from backend
                let errorMsg = 'Failed to fetch saved pins status.';
                try {
                    const errorData = await savedResponse.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (_) { } // Ignore if response is not JSON
                throw new Error(errorMsg);
            }
            const savedPinsData = await savedResponse.json();
            setSavedPinIds(new Set(savedPinsData.map(pin => pin._id)));
            setError(null); // Clear previous errors if successful
        } catch (err) {
            console.error('Error fetching saved pins:', err);
            setError(err.message); // Set error state to display
            setSavedPinIds(new Set()); // Reset saved pins on error
        }
    }, [currentUser]); // Dependency on currentUser

    // *** Function to fetch all pins and saved status ***
    const fetchPinsAndSavedStatus = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSaveError(null);
        try {
            // Fetch all pins
            const pinsResponse = await fetch(`${API_URL}/pins`);
            if (!pinsResponse.ok) throw new Error('Failed to fetch pins.');
            const pinsData = await pinsResponse.json();
            setPins(pinsData);

            // Fetch saved pins status using the helper
            await fetchSavedPinsData();

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Failed to load pins.');
            setPins([]); // Clear pins on error
            setSavedPinIds(new Set()); // Clear saved status on error
        } finally {
            setLoading(false);
        }
    }, [fetchSavedPinsData]); // Dependency on the memoized fetchSavedPinsData

    useEffect(() => {
        fetchPinsAndSavedStatus();
    }, [fetchPinsAndSavedStatus]); // Use the memoized function

    const handleSavePin = async (pinId, shouldSave) => {
        if (!currentUser) {
            setSaveError("You must be logged in to save pins.");
            return;
        }
        setSaveError(null);

        try {
            const response = await fetch(`${API_URL}/pins/${pinId}/save`, {
                method: 'PUT',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to ${shouldSave ? 'save' : 'unsave'} pin.`);
            }

            const result = await response.json();

            // *** FIX: Update state based ONLY on the backend response ***
            if (result.savedPins && Array.isArray(result.savedPins)) {
                setSavedPinIds(new Set(result.savedPins));
            } else {
                // If backend response is unexpected, refetch for safety
                console.warn("Backend response for save/unsave did not contain expected 'savedPins' array. Refetching...");
                await fetchSavedPinsData(); // Refetch just the saved status
            }

        } catch (err) {
            console.error("Error saving/unsaving pin:", err);
            setSaveError(err.message);
            // On error, refetch to ensure consistency
            await fetchSavedPinsData();
        }
    };

    // --- Loading State ---
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // --- Error State ---
    if (error && pins.length === 0) { // Show error only if pins couldn't be loaded at all
        return <Alert severity="error" sx={{ m: 2 }}>{`Error loading pins: ${error}`}</Alert>;
    }

    return (
        <Box sx={{ width: 'auto', p: 1 }}>
            {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
            {/* Show general fetch error if it occurred but some pins might still be displayed */}
            {error && !loading && pins.length > 0 && <Alert severity="warning" sx={{ mb: 2 }}>{`Warning: ${error}`}</Alert>}
            <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2} >
                {pins.map(pin => {
                    // Pass the handleSavePin function only if a user is logged in
                    const currentOnSave = currentUser ? handleSavePin : null;
                    return (
                        <div key={pin._id}>
                            <Pin
                                pin={pin}
                                onSave={currentOnSave} // Pass the conditional save handler
                                isSaved={savedPinIds.has(pin._id)}
                                onDelete={null} // No delete on home feed
                            />
                        </div>
                    );
                })}
            </Masonry>
        </Box>
    );
};

export default PinList;