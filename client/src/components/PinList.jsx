import React, { useEffect } from 'react';
import Pin from './Pin';
import Masonry from 'react-masonry-css';
import './PinList.css';
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useGetPins } from '@/hooks/api/useGetPins';
import { useGetSavedPinIds } from '@/hooks/api/useGetSavedPinIds';
import { useInView } from 'react-intersection-observer';
import { useGetPins } from '@/hooks/api/useGetPins';
import { SaveToBoardDialog } from './SaveToBoardDialog';

const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    900: 2,
    600: 1
};

const PinList = () => {
    const { currentUser } = useAuth();

    const [pinToSave, setPinToSave] = useState(null);


    const {
        data: pinsData,
        error: pinsError,
        isLoading: pinsLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useGetPins();

    const {
        data: savedPinIds,
        error: savedPinsError,
        isLoading: savedPinsLoading
    } = useGetSavedPinIds();

    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const handleSavePin = (pinId) => {
        if (!currentUser) return;
        setPinToSave(pinId);
    };


    const allPins = pinsData?.pages.flatMap(page => page.pins) || [];
    const combinedError = pinsError || savedPinsError;
    const combinedLoading = pinsLoading || (currentUser && savedPinsLoading);

    if (combinedLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading...
            </div>
        );
    }

    if (combinedError && allPins.length === 0) {
        return (
            <Alert variant="destructive" className="m-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{`Error loading pins: ${combinedError.message}`}</AlertDescription>
            </Alert>
        );
    }

    if (pinsError && allPins.length === 0) {
        return (
            <Alert variant="destructive" className="m-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{`Error loading pins: ${pinsError.message}`}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="p-4">
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
            >
                {allPins.map(pin => {
                    const currentOnSave = currentUser ? handleSavePin : null;
                    return (
                        <div key={pin._id}>
                            <Pin
                                pin={pin}
                                onSave={currentOnSave}
                                isSaved={(savedPinIds || new Set()).has(pin._id)}
                                onDelete={null}
                            />
                        </div>
                    );
                })}
            </Masonry>

            <SaveToBoardDialog
                pinId={pinToSave}
                isOpen={!!pinToSave}
                onOpenChange={() => setPinToSave(null)}
            />

            <div ref={ref} className="flex justify-center my-4">
                {isFetchingNextPage}
                {!hasNextPage && allPins.length > 0 && <p>No more pins to load.</p>}
            </div>
        </div>
    );

    //old mui way
    // return (
    //     <Box sx={{ width: 'auto', p: 1 }}>
    //         {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
    //         {/* Show general fetch error if it occurred but some pins might still be displayed */}
    //         {error && !loading && pins.length > 0 && <Alert severity="warning" sx={{ mb: 2 }}>{`Warning: ${error}`}</Alert>}
    //         <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2} >
    //             {pins.map(pin => {
    //                 // Pass the handleSavePin function only if a user is logged in
    //                 const currentOnSave = currentUser ? handleSavePin : null;
    //                 return (
    //                     <div key={pin._id}>
    //                         <Pin
    //                             pin={pin}
    //                             onSave={currentOnSave} // Pass the conditional save handler
    //                             isSaved={savedPinIds.has(pin._id)}
    //                             onDelete={null} // No delete on home feed
    //                         />
    //                     </div>
    //                 );
    //             })}
    //         </Masonry>
    //     </Box>
    // );
};

export default PinList;