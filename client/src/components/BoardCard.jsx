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
import { Bookmark, Trash2 } from 'lucide-react';
import { useDeleteBoard } from '@/hooks/api/useDeleteBoard';

const BoardPreview = ({ pins }) => {
  const pinPreviews = pins || [];
  if (pinPreviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <Bookmark className="h-10 w-10 text-muted-foreground/50" />
      </div>
    );
  }

  if (pinPreviews.length === 1) {
    return (
      <img
        src={pinPreviews[0].image.url}
        alt={pinPreviews[0].title}
        className="h-full w-full object-cover"
      />
    );
  }

  if (pinPreviews.length === 2) {
    return (
      <div className="grid grid-cols-2 h-full">
        <img src={pinPreviews[0].image.url} alt="Pin 1" className="h-full w-full object-cover" />
        <img src={pinPreviews[1].image.url} alt="Pin 2" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 grid-rows-2 h-full">
      {/* Hero slot */}
      <div className="col-span-1 row-span-2 h-full">
        <img src={pinPreviews[0].image.url} alt="Pin 1" className="h-full w-full object-cover" />
      </div>
      {/* Top right */}
      <div className="col-span-1 row-span-1 h-full">
        <img src={pinPreviews[1].image.url} alt="Pin 2" className="h-full w-full object-cover" />
      </div>
      {/* Bottom right */}
      <div className="col-span-1 row-span-1 h-full">
        <img src={pinPreviews[2].image.url} alt="Pin 3" className="h-full w-full object-cover" />
      </div>
    </div>
  );
};

export const BoardCard = ({ board }) => {
  const { mutate: deleteBoard, isLoading } = useDeleteBoard();

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteBoard(board._id);
  };

  return (
    <AlertDialog>
      <Card className="hover:shadow-lg  relative aspect-square w-full border-none p-0 group overflow-hidden rounded-lg shadow-md">
        <RouterLink to={`/board/${board._id}`} className="absolute inset-0 z-0">
          <div className="h-full w-full">
            <BoardPreview pins={board.pins} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-3 text-white">
            <h3 className="text-lg font-semibold truncate" title={board.name}>
              {board.name}
            </h3>
            <p className="text-sm text-white/90">
              {board.pins?.length || 0} {board.pins?.length === 1 ? 'Pin' : 'Pins'}
            </p>
          </div>
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
            {isLoading ? <p>Deleting...</p> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};