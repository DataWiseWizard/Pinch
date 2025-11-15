import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from './ui/button';
import { Bookmark, Trash2} from 'lucide-react';
import { useDeleteBoard } from '@/hooks/api/useDeleteBoard';

export const BoardCard = ({ board }) => {
  const { mutate: deleteBoard, isLoading } = useDeleteBoard();

  const handleDelete = (e) => {
    e.preventDefault();
    deleteBoard(board._id);
  };

  return (
    <AlertDialog>
      <Card className="hover:shadow-lg transition-shadow relative group">
        <RouterLink to={`/board/${board._id}`} className="block">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 truncate">
              <Bookmark />
              {board.name}
            </CardTitle>
            <CardDescription>
              {board.pins?.length || 0} {board.pins?.length === 1? 'Pin' : 'Pins'}
            </CardDescription>
          </CardHeader>
        </RouterLink>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
      </Card>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the "{board.name}" board. 
            (Note: This will not delete the {board.pins?.length || 0} pins on it.)
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading? <p>Deleting...</p> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};