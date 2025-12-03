import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Pin from '../components/Pin';
import API_URL from '../apiConfig';
// import { useNavigate } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FaPen } from "react-icons/fa";
import { CiSquarePlus } from "react-icons/ci";
import { useGetCreatedPins } from '@/hooks/api/useGetCreatedPins';
import { useGetBoards } from '@/hooks/api/useGetBoards';
import { useGetSavedPinIds } from '@/hooks/api/useGetSavedPinIds';
import { useDeletePin } from '@/hooks/api/useDeletePin';
import { SaveToBoardDialog } from '../components/SaveToBoardDialog';
import { CreateBoardDialog } from '@/components/CreateBoardDialog';
import { BoardCard } from '@/components/BoardCard';


const ProfilePage = () => {
    const { currentUser, getAuthHeaders, setCurrentUser } = useAuth();
    const [pinToSave, setPinToSave] = useState(null);
    // const [accountDeleteError, setAccountDeleteError] = useState(null);
    // const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editUsername, setEditUsername] = useState(currentUser?.username || "");
    const [editPassword, setEditPassword] = useState("");
    const [editImage, setEditImage] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const {
        data: createdPins,
        isLoading: loadingCreated,
        error: createdError
    } = useGetCreatedPins();

    const {
        data: boards,
        isLoading: loadingBoards,
        error: boardsError
    } = useGetBoards();

    const {
        data: savedPinIds
    } = useGetSavedPinIds();

    const {
        mutate: deletePin,
        error: deleteError
    } = useDeletePin();

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const headers = await getAuthHeaders();
            const formData = new FormData();
            formData.append('username', editUsername);

            if (editPassword && editPassword.trim() !== "") {
                formData.append('password', editPassword);
            }

            if (editImage) {
                formData.append('profileImage', editImage);
            }

            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    ...headers,
                    'Authorization': headers.Authorization
                },
                body: formData
            });

            if (!response.ok) throw new Error("Failed to update profile");

            const updatedUser = await response.json();
            setCurrentUser(updatedUser);
            toast.success("Profile updated successfully!");
            setEditPassword("");
            setIsEditOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };


    const handleDeletePin = (pinId) => {
        if (window.confirm("Are you sure you want to delete this pin?")) {
            deletePin(pinId);
        }
    };

    const handleSavePin = (pinId) => {
        if (!currentUser) return;
        setPinToSave(pinId);
    };
    // const handleDeleteAccount = async () => {

    //     setAccountDeleteError(null);


    //     if (window.confirm("Are you sure you want to delete your account? This action is permanent and cannot be undone.")) {
    //         if (window.confirm("Please confirm one last time. All your created pins and personal data will be lost forever.")) {
    //             setIsDeletingAccount(true);
    //             try {
    //                 const headers = await getAuthHeaders();
    //                 const response = await fetch(`${API_URL}/api/user/delete`, {
    //                     method: 'DELETE',
    //                     headers
    //                 });

    //                 if (!response.ok) {
    //                     const errorData = await response.json().catch(() => ({}));
    //                     throw new Error(errorData.message || "Failed to delete account.");
    //                 }


    //                 await logout();
    //                 navigate('/');

    //             } catch (err) {
    //                 console.error("Error deleting account:", err);
    //                 setAccountDeleteError(err.message);
    //                 setIsDeletingAccount(false);
    //             }
    //         }
    //     }
    // };

    const breakpointColumnsObj = {
        default: 5,
        1100: 4,
        700: 3,
        500: 2
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
                                onAction={tabType === 'created' ? handleDeletePin : null}
                                actionIcon={tabType === 'created' ? "delete" : null}
                                onSave={handleSavePin}
                                isSaved={savedPinIds?.has(pin._id)}
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

    const renderBoardGrid = (boards, isLoading) => {
        if (isLoading) {
            return <div className="flex justify-center my-4"><p className="h-8 w-8" >Loading</p></div>;
        }

        return (
            <div>
                <div className="flex justify-end mb-4">
                    <Button onClick={() => setIsCreateBoardOpen(true)}>
                        <CiSquarePlus className="mr-2 h-4 w-4" /> Create Board
                    </Button>
                </div>

                {(boards && boards.length > 0) ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {boards.map(board => (
                            <BoardCard key={board._id} board={board} />
                        ))}
                    </div>
                ) : (
                    <p className="mt-4 text-center text-muted-foreground">
                        You haven't created any boards yet.
                    </p>
                )}
            </div>
        );
    }


    if (!currentUser) {
        return (
            <div className="max-w-md mx-auto mt-4 p-4">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Please log in to view your profile.</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (loadingCreated || (currentUser && loadingBoards)) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading...
            </div>
        );
    }

    const combinedError = createdError || boardsError || deleteError;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex flex-col items-center mb-8">
                <Avatar className="w-32 h-32 mb-4">
                    <AvatarImage src={currentUser?.profileImage || '/broken-image.jpg'} alt={currentUser?.username} />
                    <AvatarFallback>{currentUser?.username?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <h1 className="text-4xl font-bold">{currentUser?.username}</h1>
                <p className="text-lg text-muted-foreground">{currentUser?.email}</p>
                <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full shadow-md"
                    onClick={() => setIsEditOpen(true)}
                >
                    <FaPen className="h-4 w-4" />
                </Button>
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
                    <TabsTrigger value="boards">Boards</TabsTrigger>
                </TabsList>

                <TabsContent value="created" className="mt-6">
                    {renderPinGrid(createdPins || [], loadingCreated, 'created')}
                </TabsContent>

                <TabsContent value="boards" className="mt-6">
                    {renderBoardGrid(boards || [], loadingBoards)}
                </TabsContent>
            </Tabs>

            <SaveToBoardDialog
                pinId={pinToSave}
                isOpen={!!pinToSave}
                onOpenChange={() => setPinToSave(null)}
            />
            <CreateBoardDialog
                isOpen={isCreateBoardOpen}
                onOpenChange={setIsCreateBoardOpen}
            />

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleProfileUpdate} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                                Username
                            </Label>
                            <Input
                                id="username"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                New Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Leave blank to keep current"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="picture" className="text-right">
                                Picture
                            </Label>
                            <Input
                                id="picture"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setEditImage(e.target.files[0])}
                                className="col-span-3"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? <p className="animate-spin mr-2" >Loading...</p> : null}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProfilePage;