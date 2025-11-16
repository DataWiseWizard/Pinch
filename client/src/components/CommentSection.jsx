import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useGetComments } from '@/hooks/api/useGetComments';
import { useCreateComment } from '@/hooks/api/useCreateComment';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from './ui/button';
// import { Loader2Icon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CommentSection = ({ pinId }) => {
    const { currentUser } = useAuth();
    const { 
        data: allComments = [], 
        isLoading: isLoadingComments, 
        error: commentsError 
    } = useGetComments(pinId);
    
    const { 
        mutate: createComment, 
        isLoading: isCreatingComment 
    } = useCreateComment();

    const handlePostComment = (content) => {
        createComment({ pinId, content });
    };

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 py-8">
            <h2 className="text-2xl font-semibold">Comments ({allComments.length})</h2>

            {currentUser ? (
                <CommentForm
                    onSubmit={handlePostComment}
                    isLoading={isCreatingComment}
                    placeholder="Add your comment..."
                    submitLabel="Post"
                />
            ) : (
                <Alert>
                    <AlertDescription className="flex items-center justify-between">
                        You must be logged in to comment.
                        <Button asChild size="sm">
                            <Link to="/login">Login</Link>
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* --- COMMENT LIST --- */}
            {isLoadingComments && (
                <div className="flex justify-center items-center py-8">
                    <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {commentsError && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Could not load comments. Please try again later.
                    </AlertDescription>
                </Alert>
            )}

            {!isLoadingComments && !commentsError && (
                <CommentList
                    allComments={allComments}
                    pinId={pinId}
                    parentId={null}
                />
            )}
        </div>
    );
};