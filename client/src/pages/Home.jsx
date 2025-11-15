import React from 'react';
import PinList from '../components/PinList';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';


const Home = () => {
    return (
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-3">            
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">
                    Pinch Feed
                </h1>
                <Button asChild>
                    <RouterLink to="/pins/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Pin
                    </RouterLink>
                </Button>
            </div>
            
            <PinList />
        </div>
    );
};

export default Home;