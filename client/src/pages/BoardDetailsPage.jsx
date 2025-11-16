import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import Pin from '../components/Pin';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import '../components/PinList.css';
import { useGetSavedPinIds } from '@/hooks/api/useGetSavedPinIds';
import { SaveToBoardDialog } from '@/components/SaveToBoardDialog';
import { useAuth } from '@/context/AuthContext';
import { useGetBoardDetails } from '@/hooks/api/useGetBoardDetails';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRemovePinFromBoard } from '@/hooks/api/useRemovePinFromBoard';

const BoardDetailPage = () => {
    const { boardId } = useParams();
    const { currentUser } = useAuth();
    const [pinToSave, setPinToSave] = useState(null);
    const { data: board, isLoading, error } = useGetBoardDetails(boardId);
    const { data: savedPinIds } = useGetSavedPinIds();

    const queryClient = useQueryClient();
    const { mutate: removePin, isLoading: isRemoving } = useRemovePinFromBoard({
        onSuccess: () => {
            toast.success("Pin removed from board");
            queryClient.invalidateQueries({ queryKey: ['myBoards', boardId] });
            queryClient.invalidateQueries({ queryKey: ['savedPinIds', currentUser?._id] });
        },
        onError: (err) => {
            toast.error(err.message || "Failed to remove pin");
        }
    });

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

    const handleRemovePin = (pinId) => {
        if (window.confirm("Are you sure you want to remove this pin from this board?")) {
            removePin({ pinId, boardId });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="h-10 w-10 animate-spin" >Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="m-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold">{board.name}</h1>
                {board.description && (
                    <p className="text-lg text-muted-foreground mt-2">{board.description}</p>
                )}
            </div>

            {(board.pins && board.pins.length > 0) ? (
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {board.pins.map(pin => (
                        <div key={pin._id}>
                            <Pin
                                pin={pin}
                                onAction={handleRemovePin} 
                                actionIcon="remove"
                                onSave={handleSavePin}
                                isSaved={(savedPinIds || new Set()).has(pin._id)}
                            />
                        </div>
                    ))
                    }
                </Masonry>
            ) : (<p className="mt-4 text-center text-muted-foreground"> There are no pins on this board yet. </p>)}
            <SaveToBoardDialog
                pinId={pinToSave}
                isOpen={!!pinToSave}
                onOpenChange={() => setPinToSave(null)}
            />
        </div>
    );
};

export default BoardDetailPage;