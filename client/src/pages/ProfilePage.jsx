import React, { useState, useEffect, useCallback } from 'react';
import Masonry from '@mui/lab/Masonry';
import { useAuth } from '../context/AuthContext';
import Pin from '../components/Pin';
import API_URL from '../apiConfig';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoaderCircle, AlertCircle } from 'lucide-react';
// import Container from '@mui/material/Container';
// import Box from '@mui/material/Box';
// import Avatar from '@mui/material/Avatar';
// import Typography from '@mui/material/Typography';
// import CircularProgress from '@mui/material/CircularProgress';
// import Alert from '@mui/material/Alert';
// import Tabs from '@mui/material/Tabs';
// import Tab from '@mui/material/Tab';
// import Button from '@mui/material/Button';

const ProfilePage = () => {
    const { currentUser, getAuthHeaders, logout } = useAuth();
    const navigate = useNavigate();
    const [createdPins, setCreatedPins] = useState([]);
    const [savedPins, setSavedPins] = useState([]);
    const [savedPinIds, setSavedPinIds] = useState(new Set()); // Keep track of saved IDs
    const [loadingCreated, setLoadingCreated] = useState(true);
    const [loadingSaved, setLoadingSaved] = useState(true);
    const [error, setError] = useState(null); // General error for fetching
    const [deleteError, setDeleteError] = useState(null);
    const [saveError, setSaveError] = useState(null); // Error for saving actions
    const [currentTab, setCurrentTab] = useState(0);
    const [accountDeleteError, setAccountDeleteError] = useState(null);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);


    const fetchCreatedPins = useCallback(async () => {
        if (!currentUser) return;
        setLoadingCreated(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/pins/user/${currentUser._id}`, {
                headers
                // const response = await fetch(`${API_URL}/pins/user/${currentUser._id}`, {
                //     credentials: 'include' // <-- ADD THIS
            }); if (!response.ok) throw new Error('Could not fetch created pins.');
            const data = await response.json();
            setCreatedPins(data);
        } catch (err) { setError(err.message); }
        finally { setLoadingCreated(false); }
    }, [currentUser, getAuthHeaders]);

    // --- Fetch Saved Pins ---
    const fetchSavedPins = useCallback(async () => {
        if (!currentUser) return;
        setLoadingSaved(true);
        setError(null); // Clear general error
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/pins/saved`, {
                headers
                // const response = await fetch(`${API_URL}/pins/saved`, {
                //     credentials: 'include' // <-- ADD THIS
            }); if (!response.ok) throw new Error('Could not fetch saved pins.');
            const data = await response.json();
            setSavedPins(data);
            setSavedPinIds(new Set(data.map(pin => pin._id))); // Update the Set of saved IDs
        } catch (err) { setError(err.message); }
        finally { setLoadingSaved(false); }
    }, [currentUser, getAuthHeaders]);


    useEffect(() => {
        fetchCreatedPins();
        fetchSavedPins();
    }, [fetchCreatedPins, fetchSavedPins]); // Depend on the memoized functions


    const handleDeletePin = async (pinIdToDelete) => {
        setDeleteError(null);
        // Optimistically remove from the 'Created' pins list
        const originalCreatedPins = [...createdPins];
        setCreatedPins(currentPins => currentPins.filter(pin => pin._id !== pinIdToDelete));

        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/pins/${pinIdToDelete}`, {
                method: 'DELETE',
                headers
            });
            if (!response.ok) {
                let errorMsg = `HTTP error! Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (_) { }
                throw new Error(errorMsg);
            }
            // If successful, also refetch saved pins in case the deleted pin was saved
            await fetchSavedPins();

        } catch (err) {
            console.error("Error deleting pin:", err);
            setDeleteError(err.message || "Could not delete pin. Please try again.");
            // Revert optimistic update on error
            setCreatedPins(originalCreatedPins);
        }
    };

    const handleSavePin = async (pinId, shouldSave) => {
        if (!currentUser) {
            setSaveError("You must be logged in.");
            return;
        }
        setSaveError(null);

        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/pins/${pinId}/save`, {
                method: 'PUT',
                headers
                // const response = await fetch(`${API_URL}/pins/${pinId}/save`, {
                //     method: 'PUT',
                //     credentials: 'include' // <-- ADD THIS
            }); if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to ${shouldSave ? 'save' : 'unsave'} pin.`);
            }
            const result = await response.json();

            // Update state based ONLY on the backend response
            if (result.savedPins && Array.isArray(result.savedPins)) {
                setSavedPinIds(new Set(result.savedPins)); // Update the Set of IDs

                // *** FIX: If currently viewing the "Saved" tab, refetch the saved pins list ***
                if (currentTab === 1) {
                    await fetchSavedPins();
                }
            } else {
                // Fallback: If response format is wrong, refetch saved pins
                console.warn("Backend save/unsave response missing 'savedPins'. Refetching saved pins.");
                await fetchSavedPins();
            }

        } catch (err) {
            console.error("Error saving/unsaving pin:", err);
            setSaveError(err.message);
            // On error, refetch saved pins to ensure consistency
            await fetchSavedPins();
        }
    };

    // --- Tab Handling ---
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleDeleteAccount = async () => {
        setAccountDeleteError(null);

        // Add multiple confirmations for safety
        if (window.confirm("Are you sure you want to delete your account? This action is permanent and cannot be undone.")) {
            if (window.confirm("Please confirm one last time. All your created pins and personal data will be lost forever.")) {
                setIsDeletingAccount(true);
                try {
                    const headers = await getAuthHeaders();
                    const response = await fetch(`${API_URL}/api/user/delete`, {
                        method: 'DELETE',
                        headers
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || "Failed to delete account.");
                    }

                    // If successful, log out and redirect
                    await logout(); // Call logout from context
                    navigate('/'); // Redirect to homepage

                } catch (err) {
                    console.error("Error deleting account:", err);
                    setAccountDeleteError(err.message);
                    setIsDeletingAccount(false);
                }
            }
        }
    };

    if ((loadingCreated || loadingSaved) && !currentUser) { // Adjust initial loading check
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    }

    const breakpointColumnsObj = {
        default: 4,
        1100: 3,
        700: 2,
        500: 1
    };

    const renderPinGrid = (pins, isLoading, tabType) => {
        if (isLoading) {
            return <div className="flex justify-center my-4"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
        }
        if (pins.length > 0) {
            return (
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {pins.map(pin => (
                        <div key={pin._id}>
                            <Pin
                                pin={pin}
                                onDelete={tabType === 'created' ? handleDeletePin : null}
                                onSave={handleSavePin}
                                isSaved={savedPinIds.has(pin._id)}
                            />
                        </div>
                    ))}
                </Masonry>
            );
        }
        return <p className="mt-4 text-center text-muted-foreground">
            {tabType === 'created' ? "You haven't created any pins yet." : "You haven't saved any pins yet."}
        </p>;
    };

    if (!currentUser && !(loadingCreated || loadingSaved)) {
        return (
            <div className="max-w-md mx-auto mt-4 p-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Please log in to view your profile.</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex flex-col items-center mb-8">
                <Avatar className="w-32 h-32 mb-4">
                    <AvatarImage src={currentUser?.profileImage || '/broken-image.jpg'} alt={currentUser?.username} />
                    <AvatarFallback>{currentUser?.username?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <h1 className="text-4xl font-bold">{currentUser?.username}</h1>
                <p className="text-lg text-muted-foreground">{currentUser?.email}</p>
            </div>

            {error && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            {deleteError && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertTitle>Delete Error</AlertTitle><AlertDescription>{deleteError}</AlertDescription></Alert>}
            {saveError && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertTitle>Save Error</AlertTitle><AlertDescription>{saveError}</AlertDescription></Alert>}

            <Tabs defaultValue="created" onValueChange={(value) => setCurrentTab(value)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                    <TabsTrigger value="created">Created</TabsTrigger>
                    <TabsTrigger value="saved">Saved</TabsTrigger>
                </TabsList>
                <TabsContent value="created" className="mt-6">
                    {renderPinGrid(createdPins, loadingCreated, 'created')}
                </TabsContent>
                <TabsContent value="saved" className="mt-6">
                    {renderPinGrid(savedPins, loadingSaved, 'saved')}
                </TabsContent>
            </Tabs>

            <div className="mt-12 p-6 border border-destructive/50 rounded-lg bg-destructive/5 text-center">
                <h2 className="text-xl font-semibold text-destructive mb-2">Danger Zone</h2>
                <p className="text-muted-foreground mb-4">
                    Deleting your account is permanent. All your created pins and personal data will be removed.
                </p>
                <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                >
                    {isDeletingAccount ? (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isDeletingAccount ? "Deleting..." : "Delete My Account"}
                </Button>
                {accountDeleteError && (
                    <Alert variant="destructive" className="mt-4 text-left">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{accountDeleteError}</AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
    //old mui way for rendering content
    // // --- Not Logged In State ---
    // if (!currentUser) {
    //     return (
    //         <Container maxWidth="sm" sx={{ mt: 4 }}>
    //             <Alert severity="warning">Please log in to view your profile.</Alert>
    //         </Container>
    //     );
    // }

    // const renderContent = () => {
    //     const isLoading = currentTab === 0 ? loadingCreated : loadingSaved;
    //     const pinsToDisplay = currentTab === 0 ? createdPins : savedPins;
    //     const currentError = error || (currentTab === 0 ? deleteError : saveError); // Combine general and specific errors


    //     if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;

    //     // Display specific action errors first if they exist
    //     if (currentError && !error) { // Show action error if no general fetch error
    //         // Error is already displayed above the tabs, avoid duplication here if needed
    //         return <Alert severity="error" sx={{ mt: 2 }}>{currentError}</Alert>;
    //     }
    //     // Then display general fetch error if pins couldn't load
    //     else if (error && pinsToDisplay.length === 0) {
    //         return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    //     }


    //     if (pinsToDisplay.length > 0) {
    //         return (
    //             <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
    //                 {pinsToDisplay.map(pin => (
    //                     <div key={pin._id}>
    //                         <Pin
    //                             pin={pin}
    //                             onDelete={currentTab === 0 ? handleDeletePin : null}
    //                             onSave={handleSavePin} // Pass save handler to both tabs
    //                             isSaved={savedPinIds.has(pin._id)} // Check against the Set
    //                         />
    //                     </div>
    //                 ))}
    //             </Masonry>
    //         );
    //     }
    //     return <Typography sx={{ mt: 4, textAlign: 'center' }}>
    //         {currentTab === 0 ? "You haven't created any pins yet." : "You haven't saved any pins yet."}
    //     </Typography>;
    // };



    // return (
    //     <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
    //         {/* Profile Header */}
    //         <Box
    //             sx={{
    //                 display: 'flex',
    //                 flexDirection: 'column',
    //                 alignItems: 'center',
    //                 mb: 4,
    //             }}
    //         >
    //             <Avatar
    //                 alt={currentUser.username}
    //                 src={currentUser.profileImage || '/broken-image.jpg'} // Use profileImage or fallback
    //                 sx={{ width: 120, height: 120, mb: 2 }}
    //             />
    //             <Typography variant="h4" component="h1">
    //                 {currentUser.username}
    //             </Typography>
    //             <Typography variant="body1" color="text.secondary">
    //                 {currentUser.email}
    //             </Typography>
    //         </Box>

    //         {/* User Pins Section Title (Optional) */}
    //         <Typography variant="h5" component="h2" gutterBottom align="center">Your Pins</Typography>

    //         <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
    //             <Tabs value={currentTab} onChange={handleTabChange} centered>
    //                 <Tab label="Created" />
    //                 <Tab label="Saved" />
    //             </Tabs>
    //         </Box>

    //         {/* Display errors specific to actions above the content */}
    //         {deleteError && currentTab === 0 && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
    //         {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
    //         {/* Display general fetch error if it occurred */}
    //         {error && <Alert severity="error" sx={{ mb: 2 }}>{`Error: ${error}`}</Alert>}


    //         {renderContent()}

    //         <Box sx={{
    //             mt: 6, // Add more margin at the top
    //             p: 3,
    //             border: '1px solid',
    //             borderColor: 'error.main', // Use theme's error color
    //             borderRadius: 2,
    //             textAlign: 'center',
    //             backgroundColor: 'rgba(211, 47, 47, 0.05)' // Faint red background
    //         }}>
    //             <Typography variant="h6" color="error" gutterBottom>
    //                 Danger Zone
    //             </Typography>
    //             <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
    //                 Deleting your account is permanent. All your created pins, saved pins, and personal data will be permanently removed.
    //             </Typography>
    //             <Button
    //                 variant="contained"
    //                 color="error"
    //                 onClick={handleDeleteAccount}
    //                 disabled={isDeletingAccount}
    //             >
    //                 {isDeletingAccount ? "Deleting..." : "Delete My Account"}
    //             </Button>
    //             {accountDeleteError && (
    //                 <Alert severity="error" sx={{ mt: 2 }}>
    //                     {accountDeleteError}
    //                 </Alert>
    //             )}
    //         </Box>
    //     </Container>
    // );
};

export default ProfilePage;