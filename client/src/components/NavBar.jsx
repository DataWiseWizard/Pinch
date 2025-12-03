import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pin, Search, LogOut, User, Settings, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import API_URL from '../apiConfig';

const Navbar = () => {
    const { currentUser, logout, getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    // const handleLogout = async () => {
    //     await logout();
    //     navigate('/login');
    // };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'DELETE',
                headers,
            });

            if (response.ok) {
                logout();
                navigate('/');
            } else {
                console.error("Failed to delete account");
            }
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-[1800px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

                {/* Logo */}
                <RouterLink to="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-90 transition-opacity">
                    <img src="/PinWheel.svg" alt="Logo" className="h-8 w-8" />
                    <span className="hidden md:inline">Pinch</span>
                </RouterLink>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search for ideas..."
                        className="pl-10 w-full bg-secondary/50 border-transparent focus:bg-background transition-colors rounded-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                {/* Right Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    {currentUser ? (
                        <>
                            <Button variant="ghost" asChild className="hidden md:flex">
                                <Link to="/">Home</Link>
                            </Button>
                            <Button asChild className="rounded-full">
                                <Link to="/pins/new">Create</Link>
                            </Button>

                            {/* USER DROPDOWN MENU */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-10 w-10 border-2 border-border hover:border-primary transition-colors">
                                            <AvatarImage src={currentUser.profileImage} alt={currentUser.username} />
                                            <AvatarFallback>{currentUser.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{currentUser.username}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {currentUser.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile?edit=true" className="cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive cursor-pointer"
                                        onSelect={() => setShowDeleteAlert(true)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete Account</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                                <Link to="/login">Log in</Link>
                            </Button>
                            <Button asChild>
                                <Link to="/signup">Sign up</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* DELETE ACCOUNT ALERT DIALOG */}
            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </nav>
    );

    //     return (
    //         <nav className="sticky top-0 z-50 flex items-center justify-between w-full px-6 py-3 bg-background border-b">
    //             <RouterLink to="/" className="flex items-center gap-2 text-lg font-semibold">
    //                 <Pin className="h-6 w-6 text-white" />
    //                 <span>Pinch</span>
    //             </RouterLink>

    //             <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
    //                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
    //                 <Input
    //                     type="search"
    //                     placeholder="Search..."
    //                     className="w-full pl-8 bg-muted/50 focus:bg-background transition-colors"
    //                     value={searchQuery}
    //                     onChange={(e) => setSearchQuery(e.target.value)}
    //                 />
    //             </form>

    //             <div className="flex items-center gap-3">
    //                 {currentUser ? (
    //                     <>

    //                         <Button variant="ghost" size="sm" asChild>
    //                             <RouterLink to="/pins/new">Create</RouterLink>
    //                         </Button>

    //                         <Button variant="ghost" size="sm" asChild>
    //                             <RouterLink to="/profile">
    //                                 {currentUser.username}
    //                             </RouterLink>
    //                         </Button>

    //                         <Button variant="outline" size="sm" onClick={handleLogout}>
    //                             Log Out
    //                         </Button>
    //                     </>
    //                 ) : (
    //                     <>
    //                         <Button variant="ghost" size="sm" asChild>
    //                             <RouterLink to="/login">Log In</RouterLink>
    //                         </Button>
    //                         <Button variant="default" size="sm" asChild>
    //                             <RouterLink to="/signup">Sign Up</RouterLink>
    //                         </Button>
    //                     </>
    //                 )}
    //             </div>
    //         </nav>
    //     )
};

export default Navbar;