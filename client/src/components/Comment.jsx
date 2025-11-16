import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription } from "@/components/ui/alert";
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { useCreateReply } from '@/hooks/api/useCreateReply';
import { useUpdateComment } from '@/hooks/api/useUpdateComment';
import { useDeleteComment } from '@/hooks/api/useDeleteComment';

export const Comment = ({ comment, allComments, pinId }) => {
    const { currentUser } = useAuth();
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const { mutate: createReply, isLoading: isReplyingLoading } = useCreateReply();
    const { mutate: updateComment, isLoading: isUpdatingLoading } = useUpdateComment();
    const { mutate: deleteComment, isLoading: isDeletingLoading } = useDeleteComment();

    const isAuthor = currentUser && comment.author && currentUser._id === comment.author._id;
    const isDeleted = !comment.author; 

    const handleReplySubmit = (content) => {
        createReply({ commentId: comment._id, content }, {
            onSuccess: () => setIsReplying(false)
        });
    };

    const handleUpdateSubmit = (content) => {
        updateComment({ commentId: comment._id, content }, {
            onSuccess: () => setIsEditing(false)
        });
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            deleteComment({ commentId: comment._id, pinId });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
    };

    return (
        <div className="flex gap-3">
            <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author?.profileImage} />
                <AvatarFallback>
                    {comment.author ? comment.author.username[0].toUpperCase() : 'P'}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1">
                {!isEditing && (
                    <>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                                {comment.author ? comment.author.username : '[deleted]'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {formatDate(comment.createdAt)}
                            </span>
                        </div>
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                            {comment.content}
                        </p>

                        <div className="flex gap-2 mt-1">
                            {currentUser && !isDeleted && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-1 text-xs"
                                    onClick={() => setIsReplying(!isReplying)}
                                >
                                    Reply
                                </Button>
                            )}
                            {isAuthor && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-1 text-xs"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-1 text-xs text-destructive hover:text-destructive"
                                        onClick={handleDelete}
                                        disabled={isDeletingLoading}
                                    >
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </>
                )}

                {isEditing && isAuthor && (
                    <CommentForm
                        onSubmit={handleUpdateSubmit}
                        isLoading={isUpdatingLoading}
                        initialText={comment.content}
                        submitLabel="Update"
                    />
                )}

                {isReplying && (
                    <div className="mt-2">
                        <CommentForm
                            onSubmit={handleReplySubmit}
                            isLoading={isReplyingLoading}
                            placeholder="Write a reply..."
                            submitLabel="Reply"
                        />
                    </div>
                )}

                <div className="mt-4">
                    <CommentList
                        allComments={allComments}
                        pinId={pinId}
                        parentId={comment._id}
                    />
                </div>
            </div>
        </div>
    );
};