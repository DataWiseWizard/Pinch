import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pin, Search } from 'lucide-react';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between w-full px-6 py-3 bg-background border-b">
            <RouterLink to="/" className="flex items-center gap-2 text-lg font-semibold">
                <Pin className="h-6 w-6 text-white" />
                <span>Pinch</span>
            </RouterLink>

            <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-8 bg-muted/50 focus:bg-background transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </form>

            <div className="flex items-center gap-3">
                {currentUser ? (
                    <>

                        <Button variant="ghost" size="sm" asChild>
                            <RouterLink to="/pins/new">Create</RouterLink>
                        </Button>

                        <Button variant="ghost" size="sm" asChild>
                            <RouterLink to="/profile">
                                {currentUser.username}
                            </RouterLink>
                        </Button>

                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            Log Out
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="ghost" size="sm" asChild>
                            <RouterLink to="/login">Log In</RouterLink>
                        </Button>
                        <Button variant="default" size="sm" asChild>
                            <RouterLink to="/signup">Sign Up</RouterLink>
                        </Button>
                    </>
                )}
            </div>
        </nav>
    )
};

export default Navbar;