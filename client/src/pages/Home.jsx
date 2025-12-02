import React from 'react';
import PinList from '../components/PinList';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Home = () => {
    const { currentUser } = useAuth();

    return (
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            {!currentUser && (
                <div className="flex flex-col items-center justify-center text-center py-20 bg-muted/30 rounded-3xl mb-12 border border-border/50">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Get your next <span className="text-primary">great idea</span>.
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mb-8">
                        The visual discovery engine for finding ideas like recipes,
                        home and style inspiration, and more.
                    </p>
                    <div className="flex gap-4">
                        <Button asChild size="lg" className="rounded-full text-lg h-12 px-8">
                            <RouterLink to="/signup">Sign Up</RouterLink>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full text-lg h-12 px-8">
                            <RouterLink to="/login">Log In</RouterLink>
                        </Button>
                    </div>
                </div>
            )}
            
            {currentUser && (
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Pinch Feed</h1>
                    <Button asChild>
                        <RouterLink to="/pins/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Pin
                        </RouterLink>
                    </Button>
                </div>
            )}

            <PinList />
        </div>
    );
};

export default Home;