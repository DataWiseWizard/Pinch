// client/src/components/PinList.jsx

import React, { useState, useEffect } from 'react';
import Pin from './Pin';

import Masonry from '@mui/lab/Masonry';
import Box from '@mui/material/Box';
import { useAuth } from '../context/AuthContext';
import Alert from '@mui/material/Alert';

const PinList = () => {
    const { currentUser } = useAuth(); // Get current user
    console.log('PinList currentUser:', currentUser);
    const [pins, setPins] = useState([]);
    const [savedPinIds, setSavedPinIds] = useState(new Set()); // Use a Set for efficient lookups
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saveError, setSaveError] = useState(null);

    useEffect(() => {
        const fetchPinsAndSavedStatus = async () => {
            setLoading(true);
            setError(null);
            setSaveError(null);
            try {
                const pinsResponse = await fetch('/pins');
                if (!pinsResponse.ok) throw new Error('Failed to fetch pins.');
                const pinsData = await pinsResponse.json();
                setPins(pinsData);

                if (currentUser) {
                    const savedResponse = await fetch('/pins/saved'); // Use the new endpoint
                    if (!savedResponse.ok) throw new Error('Failed to fetch saved pins status.');
                    const savedPinsData = await savedResponse.json();
                    setSavedPinIds(new Set(savedPinsData.map(pin => pin._id)));
                } else {
                    setSavedPinIds(new Set()); // Clear saved pins if logged out
                }

            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to load pins.');
            } finally {
                setLoading(false);
            }
        };

        fetchPinsAndSavedStatus();
    }, [currentUser]);

    const handleSavePin = async (pinId, shouldSave) => {
        if (!currentUser) {
            // Optionally redirect to login or show message
            setSaveError("You must be logged in to save pins.");
            return;
        }
        setSaveError(null);

        try {
            const response = await fetch(`/pins/${pinId}/save`, {
                method: 'PUT', // Using the PUT route
                // headers: { /* Auth headers if needed */ },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to ${shouldSave ? 'save' : 'unsave'} pin.`);
            }

            const result = await response.json();

             // Update the savedPinIds Set based on the backend response
             setSavedPinIds(new Set(result.savedPins || [])); // Assuming backend returns the updated list

            // // --- OR: Optimistic update (can be slightly faster UI) ---
            setSavedPinIds(prevIds => {
                const newIds = new Set(prevIds);
                if (shouldSave) {
                    newIds.add(pinId);
                } else {
                    newIds.delete(pinId);
                }
                return newIds;
            });

        } catch (err) {
            console.error("Error saving/unsaving pin:", err);
            setSaveError(err.message);
            // // If using optimistic update, you might want to revert here
            fetchUserPins(); // Re-fetch to ensure consistency (simpler than reverting)
        }
    };

    



    return (
        <Box sx={{ width: 'auto', p: 1 }}>
             {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
             <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2} >
                {pins.map(pin => {
                     // *** CHANGE HERE: Determine onSave function inside the map ***
                    const currentOnSave = currentUser ? handleSavePin : null;
                    return (
                        <div key={pin._id}>
                            <Pin
                                pin={pin}
                                // Pass the determined function
                                onSave={currentOnSave}
                                isSaved={savedPinIds.has(pin._id)}
                                // onDelete is null here as it's the home feed
                                onDelete={null}
                            />
                        </div>
                    );
                })}
            </Masonry>
        </Box>
    );
};

export default PinList;