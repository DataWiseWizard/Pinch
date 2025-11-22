import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchPins } from '@/hooks/api/useSearchPins';
import { useGetSavedPinIds } from '@/hooks/api/useGetSavedPinIds';
import { SaveToBoardDialog } from '../components/SaveToBoardDialog';
import Masonry from 'react-masonry-css';
import { useAuth } from '../context/AuthContext';
import Pin from '@/components/Pin';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import '../components/PinList.css';

const SearchPage = () => {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [pinToSave, setPinToSave] = useState(null);
    const { data: pins, isLoading, error } = useSearchPins(query);

    const {
        data: savedPinIds
    } = useGetSavedPinIds();

    const breakpointColumnsObj = {
        default: 5,
        1100: 4,
        700: 3,
        500: 2
    };

    const handleSavePin = (pinId) => {
        if (!currentUser) return;
        setPinToSave(pinId);
    };


    if (isLoading) {
        return <div className="flex justify-center mt-8">Loading results...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">
                Results for "{query}"
            </h1>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Failed to search pins.</AlertDescription>
                </Alert>
            )}

            {pins && pins.length > 0 ? (
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {pins.map(pin => (
                        <div key={pin._id}>
                            <Pin pin={pin}
                                isSaved={(savedPinIds || new Set()).has(pin._id)}
                                onSave={currentUser ? handleSavePin : null}
                            />
                        </div>
                    ))}
                </Masonry>
            ) : (
                <p className="text-muted-foreground">No pins found matching your search.</p>
            )}

            <SaveToBoardDialog
                pinId={pinToSave}
                isOpen={!!pinToSave}
                onOpenChange={() => setPinToSave(null)}
            />
        </div>

    );
};

export default SearchPage;