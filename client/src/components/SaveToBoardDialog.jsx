import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetBoards } from '@/hooks/api/useGetBoards';
import { useCreateBoard } from '@/hooks/api/useCreateBoard';
import { useAddPinToBoard } from '@/hooks/api/useAddPinToBoard';
import { Plus } from 'lucide-react';
import { toast } from "sonner";

export const SaveToBoardDialog = ({ pinId, isOpen, onOpenChange }) => {
    const [newBoardName, setNewBoardName] = useState("");
    const queryClient = useQueryClient();
    const { currentUser } = useAuth();

    const { data: boards, isLoading: boardsLoading } = useGetBoards();

    const { mutate: createBoard, isLoading: isCreating } = useCreateBoard({
        onSuccess: (newBoard) => {
            // Automatically save the pin to the new board
            toast.success(`Board "${newBoard.name}" created!`);
            addPinToBoard({ pinId, boardId: newBoard._id });
        },
        onError: (err) => {
            toast.error(`Failed to create board: ${err.message}`);
        }
    });

    const { mutate: addPinToBoard, isLoading: isSaving } = useAddPinToBoard({
        onSuccess: (data) => {
            toast.success(data.message);
            onOpenChange(false);
        },
        onError: (err) => {
            toast.error(`Failed to save pin: ${err.message}`);
        }
    });

    const handleCreateBoard = () => {
        if (newBoardName.trim()) {
            createBoard(newBoardName, {
                onSuccess: (newBoard) => {
                    toast.success(`Board "${newBoard.name}" created!`);
                    queryClient.invalidateQueries({ queryKey: ""});
                    addPinToBoard({ pinId, boardId: newBoard._id });
                    setNewBoardName("");
                }
            });
        }
    };

    const handleSaveToBoard = (boardId) => {
        addPinToBoard({ pinId, boardId });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Save to Board</DialogTitle>
                    <DialogDescription>
                        Choose a board to save this pin to, or create a new one.
                    </DialogDescription>
                </DialogHeader>

                {boardsLoading ? (
                    <div className="flex justify-center items-center h-24">
                        Loading...
                    </div>
                ) : (
                    <ScrollArea className="h-48 pr-4">
                        <div className="grid gap-2">
                            {boards?.map((board) => (
                                <Button
                                    key={board._id}
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => handleSaveToBoard(board._id)}
                                    disabled={isSaving}
                                >
                                    {isSaving? <h4 className='className="mr-2 h-4 w-4'>Saving...</h4> : null}
                                    {board.name}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                )}

                <DialogFooter className="sm:flex-col sm:space-y-2">
                    <p className="text-sm text-muted-foreground">Create new board</p>
                    <div className="flex w-full space-x-2">
                        <Input
                            placeholder="e.g. 'Recipes', 'Inspiration'..."
                            value={newBoardName}
                            onChange={(e) => setNewBoardName(e.target.value)}
                            disabled={isCreating}
                        />
                        <Button
                            type="button"
                            size="icon"
                            onClick={handleCreateBoard}
                            disabled={isCreating || !newBoardName.trim()}
                        >
                            {isCreating ? <p>Loading...</p> : <Plus className="h-4 w-4" />}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};