import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import API_URL from '../apiConfig';
import { useGetCreatedPins } from '@/hooks/api/useGetCreatedPins';
import { useGetSavedPins } from '@/hooks/api/useGetSavedPins';
import { useGetBoards } from '@/hooks/api/useGetBoards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PinList from '../components/PinList';
import BoardCard from '../components/BoardCard';
import CreateBoardDialog from '../components/CreateBoardDialog';
import { Loader2, Plus, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
    const { currentUser, getAuthHeaders, setCurrentUser } = useAuth();
    const [searchParams] = useSearchParams();
    
    // --- STATE MANAGEMENT ---
    // Kept your existing state requirement logic
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false); // Restored this!
    
    // Edit Form State
    const [editUsername, setEditUsername] = useState(currentUser?.username || "");
    const [editImage, setEditImage] = useState(null); // File
    const [isUpdating, setIsUpdating] = useState(false);

    // Auto-open edit modal if ?edit=true is in URL
    useEffect(() => {
        if (searchParams.get('edit') === 'true') {
            setIsEditOpen(true);
        }
    }, [searchParams]);

    // --- DATA FETCHING ---
    const { 
        data: createdPinsData, 
        isLoading: loadingCreated, 
        fetchNextPage: fetchNextCreated, 
        hasNextPage: hasMoreCreated 
    } = useGetCreatedPins(currentUser?._id);

    const { 
        data: savedPinsData, 
        isLoading: loadingSaved, 
        fetchNextPage: fetchNextSaved, 
        hasNextPage: hasMoreSaved 
    } = useGetSavedPins();

    const { 
        data: boards, 
        isLoading: loadingBoards 
    } = useGetBoards(currentUser?._id);

    const createdPins = createdPinsData?.pages.flatMap(page => page.pins) || [];
    const savedPins = savedPinsData?.pages.flatMap(page => page.pins) || [];

    // --- HANDLERS ---
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        
        try {
            const headers = await getAuthHeaders();
            const formData = new FormData();
            formData.append('username', editUsername);
            if (editImage) {
                formData.append('profileImage', editImage);
            }

            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    ...headers,
                    // Don't set Content-Type for FormData, browser does it
                    'Authorization': headers.Authorization
                },
                body: formData
            });

            if (!response.ok) throw new Error("Failed to update profile");
            
            const updatedUser = await response.json();
            setCurrentUser(updatedUser); 
            toast.success("Profile updated successfully!");
            setIsEditOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    if (!currentUser) return <div className="flex justify-center p-8">Please log in.</div>;

    return (
        <div className="w-full max-w-[1800px] mx-auto">
            {/* --- COMPACT PROFILE HEADER --- */}
            {/* Improved layout: Horizontal on desktop, stacked on mobile */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-center py-8 md:py-12 bg-background border-b mb-6 gap-6 md:gap-12">
                
                {/* Avatar Section */}
                <div className="relative group shrink-0">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
                        <AvatarImage src={currentUser.profileImage} className="object-cover" />
                        <AvatarFallback className="text-4xl">{currentUser.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Button 
                        size="icon" 
                        variant="secondary" 
                        className="absolute bottom-0 right-0 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setIsEditOpen(true)}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                </div>
                
                {/* Info Section */}
                <div className="flex flex-col items-center md:items-start pt-2">
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{currentUser.username}</h1>
                    <p className="text-muted-foreground text-sm mb-4">
                        @{currentUser.username.toLowerCase().replace(/\s/g, '')} • {currentUser.email}
                    </p>
                    
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-full h-9" onClick={() => setIsEditOpen(true)}>
                            Edit Profile
                        </Button>
                        <Button variant="outline" className="rounded-full h-9">
                            Share
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- CONTENT TABS --- */}
            <div className="px-4 md:px-8">
                <Tabs defaultValue="created" className="w-full">
                    {/* Tab Navigation */}
                    <div className="flex justify-center mb-8">
                        <TabsList className="bg-transparent border-b rounded-none w-full max-w-md justify-center h-auto p-0 space-x-8">
                            <TabsTrigger 
                                value="created" 
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 text-base font-medium text-muted-foreground data-[state=active]:text-foreground"
                            >
                                Created
                            </TabsTrigger>
                            <TabsTrigger 
                                value="saved" 
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 text-base font-medium text-muted-foreground data-[state=active]:text-foreground"
                            >
                                Saved
                            </TabsTrigger>
                            <TabsTrigger 
                                value="boards" 
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 text-base font-medium text-muted-foreground data-[state=active]:text-foreground"
                            >
                                Boards
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Tab Content: Created */}
                    <TabsContent value="created" className="mt-0">
                        {loadingCreated ? (
                            <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
                        ) : createdPins.length > 0 ? (
                            <PinList 
                                pins={createdPins} 
                                fetchNextPage={fetchNextCreated} 
                                hasNextPage={hasMoreCreated} 
                            />
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">You haven't created any pins yet.</div>
                        )}
                    </TabsContent>

                    {/* Tab Content: Saved */}
                    <TabsContent value="saved" className="mt-0">
                        {loadingSaved ? (
                            <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
                        ) : savedPins.length > 0 ? (
                            <PinList 
                                pins={savedPins} 
                                fetchNextPage={fetchNextSaved} 
                                hasNextPage={hasMoreSaved} 
                            />
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">No saved pins yet.</div>
                        )}
                    </TabsContent>

                    {/* Tab Content: Boards */}
                    <TabsContent value="boards" className="mt-0">
                        {/* RESTORED: CreateBoardDialog with state control */}
                        <div className="flex justify-end mb-6 px-2">
                            <CreateBoardDialog 
                                open={isCreateBoardOpen} 
                                onOpenChange={setIsCreateBoardOpen}
                                trigger={
                                    <Button size="sm" onClick={() => setIsCreateBoardOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" /> New Board
                                    </Button>
                                }
                            />
                        </div>
                        
                        {loadingBoards ? (
                            <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
                        ) : boards && boards.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {boards.map(board => (
                                    <BoardCard key={board._id} board={board} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">No boards created yet.</div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* --- EDIT PROFILE MODAL --- */}
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
                                {isUpdating ? <Loader2 className="animate-spin mr-2" /> : null}
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


// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import Pin from '../components/Pin';
// import API_URL from '../apiConfig';
// import { useNavigate } from 'react-router-dom';
// import Masonry from 'react-masonry-css';
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Plus } from 'lucide-react';
// import { useGetCreatedPins } from '@/hooks/api/useGetCreatedPins';
// import { useGetBoards } from '@/hooks/api/useGetBoards';
// import { useGetSavedPinIds } from '@/hooks/api/useGetSavedPinIds';
// import { useDeletePin } from '@/hooks/api/useDeletePin';
// import { SaveToBoardDialog } from '../components/SaveToBoardDialog';
// import { CreateBoardDialog } from '@/components/CreateBoardDialog';
// import { BoardCard } from '@/components/BoardCard';


// const ProfilePage = () => {
//     const { currentUser, getAuthHeaders, logout } = useAuth();
//     const navigate = useNavigate();
//     const [pinToSave, setPinToSave] = useState(null);
//     const [accountDeleteError, setAccountDeleteError] = useState(null);
//     const [isDeletingAccount, setIsDeletingAccount] = useState(false);
//     const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);


//     const {
//         data: createdPins,
//         isLoading: loadingCreated,
//         error: createdError
//     } = useGetCreatedPins();

//     const {
//         data: boards,
//         isLoading: loadingBoards,
//         error: boardsError
//     } = useGetBoards();

//     const {
//         data: savedPinIds
//     } = useGetSavedPinIds();

//     const {
//         mutate: deletePin,
//         error: deleteError
//     } = useDeletePin();


//     const handleDeletePin = (pinId) => {
//         if (window.confirm("Are you sure you want to delete this pin?")) {
//             deletePin(pinId);
//         }
//     };

//     const handleSavePin = (pinId) => {
//         if (!currentUser) return;
//         setPinToSave(pinId);
//     };

//     const handleDeleteAccount = async () => {
//         setAccountDeleteError(null);


//         if (window.confirm("Are you sure you want to delete your account? This action is permanent and cannot be undone.")) {
//             if (window.confirm("Please confirm one last time. All your created pins and personal data will be lost forever.")) {
//                 setIsDeletingAccount(true);
//                 try {
//                     const headers = await getAuthHeaders();
//                     const response = await fetch(`${API_URL}/api/user/delete`, {
//                         method: 'DELETE',
//                         headers
//                     });

//                     if (!response.ok) {
//                         const errorData = await response.json().catch(() => ({}));
//                         throw new Error(errorData.message || "Failed to delete account.");
//                     }


//                     await logout();
//                     navigate('/');

//                 } catch (err) {
//                     console.error("Error deleting account:", err);
//                     setAccountDeleteError(err.message);
//                     setIsDeletingAccount(false);
//                 }
//             }
//         }
//     };

//     const breakpointColumnsObj = {
//         default: 5,
//         1100: 4,
//         700: 3,
//         500: 2
//     };

//     const renderPinGrid = (pins, isLoading, tabType) => {
//         if (isLoading) {
//             return <div className="flex justify-center my-4">Loading...</div>;
//         }
//         if (pins && pins.length > 0) {
//             return (
//                 <Masonry
//                     breakpointCols={breakpointColumnsObj}
//                     className="my-masonry-grid"
//                     columnClassName="my-masonry-grid_column"
//                 >
//                     {pins.map(pin => (
//                         <div key={pin._id}>
//                             <Pin
//                                 pin={pin}
//                                 onAction={tabType === 'created' ? handleDeletePin : null}
//                                 actionIcon={tabType === 'created' ? "delete" : null}
//                                 onSave={handleSavePin}
//                                 isSaved={savedPinIds?.has(pin._id)}
//                             />
//                         </div>
//                     ))}
//                 </Masonry>
//             );
//         }
//         return <p className="mt-4 text-center text-muted-foreground">
//             {tabType === 'created' ? "You haven't created any pins yet." : "You haven't saved any pins yet."}
//         </p>;
//     };

//     const renderBoardGrid = (boards, isLoading) => {
//         if (isLoading) {
//             return <div className="flex justify-center my-4"><p className="h-8 w-8" >Loading</p></div>;
//         }

//         return (
//             <div>
//                 <div className="flex justify-end mb-4">
//                     <Button onClick={() => setIsCreateBoardOpen(true)}>
//                         <Plus className="mr-2 h-4 w-4" /> Create Board
//                     </Button>
//                 </div>

//                 {(boards && boards.length > 0) ? (
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                         {boards.map(board => (
//                             <BoardCard key={board._id} board={board} />
//                         ))}
//                     </div>
//                 ) : (
//                     <p className="mt-4 text-center text-muted-foreground">
//                         You haven't created any boards yet.
//                     </p>
//                 )}
//             </div>
//         );
//     }

    
//     if (!currentUser) {
//         return (
//             <div className="max-w-md mx-auto mt-4 p-4">
//                 <Alert variant="destructive">
//                     <AlertTitle>Error</AlertTitle>
//                     <AlertDescription>Please log in to view your profile.</AlertDescription>
//                 </Alert>
//             </div>
//         );
//     }

//     if (loadingCreated || (currentUser && loadingBoards)) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 Loading...
//             </div>
//         );
//     }

//     const combinedError = createdError || boardsError || deleteError;

//     return (
//         <div className="max-w-6xl mx-auto p-4 md:p-8">
//             <div className="flex flex-col items-center mb-8">
//                 <Avatar className="w-32 h-32 mb-4">
//                     <AvatarImage src={currentUser?.profileImage || '/broken-image.jpg'} alt={currentUser?.username} />
//                     <AvatarFallback>{currentUser?.username?.toUpperCase()}</AvatarFallback>
//                 </Avatar>
//                 <h1 className="text-4xl font-bold">{currentUser?.username}</h1>
//                 <p className="text-lg text-muted-foreground">{currentUser?.email}</p>
//             </div>

//             {combinedError && (
//                 <Alert variant="destructive" className="mb-4">
//                     <AlertTitle>An Error Occurred</AlertTitle>
//                     <AlertDescription>{combinedError.message}</AlertDescription>
//                 </Alert>
//             )}

//             <Tabs defaultValue="created" className="w-full">
//                 <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
//                     <TabsTrigger value="created">Created</TabsTrigger>
//                     <TabsTrigger value="boards">Boards</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="created" className="mt-6">
//                     {renderPinGrid(createdPins || [], loadingCreated, 'created')}
//                 </TabsContent>

//                 <TabsContent value="boards" className="mt-6">
//                     {renderBoardGrid(boards || [], loadingBoards)}
//                 </TabsContent>
//             </Tabs>

//             <div className="mt-12 p-6 border border-destructive/50 rounded-lg bg-destructive/5 text-center">
//                 <h2 className="text-xl font-semibold text-destructive mb-2">Danger Zone</h2>
//                 <p className="text-muted-foreground mb-4">
//                     Deleting your account is permanent. All your created pins and personal data will be removed.
//                 </p>
//                 <Button
//                     variant="destructive"
//                     onClick={handleDeleteAccount}
//                     disabled={isDeletingAccount}
//                 >
//                     {isDeletingAccount ? (
//                         <h2>Loading...</h2>
//                     ) : null}
//                     {isDeletingAccount ? "Deleting..." : "Delete My Account"}
//                 </Button>
//                 {accountDeleteError && (
//                     <Alert variant="destructive" className="mt-4 text-left">
//                         <AlertTitle>Error</AlertTitle>
//                         <AlertDescription>{accountDeleteError}</AlertDescription>
//                     </Alert>
//                 )}
//             </div>

//             <SaveToBoardDialog
//                 pinId={pinToSave}
//                 isOpen={!!pinToSave}
//                 onOpenChange={() => setPinToSave(null)}
//             />
//             <CreateBoardDialog
//                 isOpen={isCreateBoardOpen}
//                 onOpenChange={setIsCreateBoardOpen}
//             />
//         </div>
//     );
// };

// export default ProfilePage;