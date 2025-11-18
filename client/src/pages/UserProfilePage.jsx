import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetUserProfile } from '@/hooks/api/useGetUserProfile';
import Masonry from 'react-masonry-css';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Pin from '@/components/Pin';
import { BoardCard } from '@/components/BoardCard';
import { useAuth } from '@/context/AuthContext';
import { useGetSavedPinIds } from '@/hooks/api/useGetSavedPinIds';
import { SaveToBoardDialog } from '@/components/SaveToBoardDialog';
import { useState } from 'react';

const UserProfilePage = () => {
    const { username } = useParams();
    const { currentUser } = useAuth();
    const [pinToSave, setPinToSave] = useState(null);

    const { 
        data: profileData, 
        isLoading, 
        error 
    } = useGetUserProfile(username);

    const { data: mySavedPinIds } = useGetSavedPinIds();

    const handleSavePin = (pinId) => {
        if (!currentUser) return;
        setPinToSave(pinId);
    };

    const breakpointColumnsObj = {
        default: 5,
        1100: 4,
        700: 3,
        500: 2
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="animate-pulse">Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto mt-12 p-4">
                <Alert variant="destructive">
                    <AlertTitle>Profile Not Found</AlertTitle>
                    <AlertDescription>
                        {error.response?.status === 404 
                            ? `The user "@${username}" does not exist.` 
                            : "An error occurred while loading the profile."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const { user, boards, createdPins } = profileData;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
                <Avatar className="w-32 h-32 mb-4">
                    <AvatarImage src={user.profileImage} alt={user.username} />
                    <AvatarFallback className="text-4xl">
                        {user.username[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <h1 className="text-4xl font-bold mb-2">{user.username}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="created" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
                    <TabsTrigger value="created">Created</TabsTrigger>
                    <TabsTrigger value="boards">Boards</TabsTrigger>
                </TabsList>

                <TabsContent value="created">
                    {createdPins && createdPins.length > 0 ? (
                        <Masonry
                            breakpointCols={breakpointColumnsObj}
                            className="my-masonry-grid"
                            columnClassName="my-masonry-grid_column"
                        >
                            {createdPins.map(pin => (
                                <div key={pin._id}>
                                    <Pin
                                        pin={pin}
                                        onSave={currentUser ? handleSavePin : null}
                                        isSaved={mySavedPinIds?.has(pin._id)}
                                    />
                                </div>
                            ))}
                        </Masonry>
                    ) : (
                        <p className="text-center text-muted-foreground mt-8">
                            No pins created yet.
                        </p>
                    )}
                </TabsContent>

                <TabsContent value="boards">
                    {boards && boards.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {boards.map(board => (
                                <div key={board._id} className="pointer-events-none opacity-100"> 
                                    <div className="pointer-events-auto">
                                        <BoardCard board={board} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground mt-8">
                            No public boards found.
                        </p>
                    )}
                </TabsContent>
            </Tabs>

            <SaveToBoardDialog
                pinId={pinToSave}
                isOpen={!!pinToSave}
                onOpenChange={() => setPinToSave(null)}
            />
        </div>
    );
};

export default UserProfilePage;