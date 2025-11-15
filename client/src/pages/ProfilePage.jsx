import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Pin from '../components/Pin';
import API_URL from '../apiConfig';
import { useNavigate } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useGetCreatedPins } from '@/hooks/api/useGetCreatedPins';
import { useGetSavedPins } from '@/hooks/api/useGetSavedPins';
import { useGetSavedPinIds } from '@/hooks/api/useGetSavedPinIds';
import { useDeletePin } from '@/hooks/api/useDeletePin';
import { SaveToBoardDialog } from './SaveToBoardDialog';


const ProfilePage = () => {
    const { currentUser, getAuthHeaders, logout } = useAuth();
    const navigate = useNavigate();
    const [accountDeleteError, setAccountDeleteError] = useState(null);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [pinToSave, setPinToSave] = useState(null);


    const {
        data: createdPins,
        isLoading: loadingCreated,
        error: createdError
    } = useGetCreatedPins();

    const {
        data: savedPins,
        isLoading: loadingSaved,
        error: savedError
    } = useGetSavedPins();

    const {
        data: savedPinIds
    } = useGetSavedPinIds();

    const {
        mutate: deletePin,
        error: deleteError
    } = useDeletePin();


    const handleDeletePin = (pinId) => {
        if (window.confirm("Are you sure you want to delete this pin?")) {
            deletePin(pinId);
        }
    };

    const handleSavePin = (pinId) => {
        setPinToSave(pinId);
    };

    const handleDeleteAccount = async () => {
        setAccountDeleteError(null);


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


                    await logout();
                    navigate('/');

                } catch (err) {
                    console.error("Error deleting account:", err);
                    setAccountDeleteError(err.message);
                    setIsDeletingAccount(false);
                }
            }
        }
    };

    const breakpointColumnsObj = {
        default: 4,
        1100: 3,
        700: 2,
        500: 1
    };

    const renderPinGrid = (pins, isLoading, tabType) => {
        if (isLoading) {
            return <div className="flex justify-center my-4">Loading...</div>;
        }
        if (pins && pins.length > 0) {
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
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Please log in to view your profile.</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (loadingCreated || (currentUser && loadingSaved)) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading...
            </div>
        );
    }

    const combinedError = createdError || savedError || deleteError || saveError;

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

            {combinedError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>An Error Occurred</AlertTitle>
                    <AlertDescription>{combinedError.message}</AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="created" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                    <TabsTrigger value="created">Created</TabsTrigger>
                    <TabsTrigger value="saved">Saved</TabsTrigger>
                </TabsList>
                <TabsContent value="created" className="mt-6">
                    {renderPinGrid(createdPins || [], loadingCreated, 'created')}
                </TabsContent>
                <TabsContent value="saved" className="mt-6">
                    {renderPinGrid(savedPins || [], loadingSaved, 'saved')}
                </TabsContent>
            </Tabs>

            <SaveToBoardDialog
                pinId={pinToSave}
                isOpen={!!pinToSave}
                onOpenChange={() => setPinToSave(null)}
            />

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
                        <h2>Loading...</h2>
                    ) : null}
                    {isDeletingAccount ? "Deleting..." : "Delete My Account"}
                </Button>
                {accountDeleteError && (
                    <Alert variant="destructive" className="mt-4 text-left">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{accountDeleteError}</AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;