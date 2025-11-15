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
import { Label } from "@/components/ui/label";
import { useCreateBoard } from '@/hooks/api/useCreateBoard';
import { toast } from "sonner";

export const CreateBoardDialog = ({ isOpen, onOpenChange }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { mutate: createBoard, isLoading } = useCreateBoard();

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Board name is required");
      return;
    }
    createBoard({name, description}, {
      onSuccess: (newBoard) => {
        toast.success(`Board "${newBoard.name}" created!`);
        onOpenChange(false);
        setName("");
        setDescription("");
      },
      onError: (err) => {
        toast.error(`Failed to create board: ${err.message}`);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogDescription>
            Create a new board to organize your pins.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 'My Next Trip'"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 'Ideas for places to visit...'"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading? <p>Loading...</p>  : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};