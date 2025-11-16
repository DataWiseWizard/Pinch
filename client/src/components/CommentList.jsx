import React, { useMemo } from 'react';
import { Comment } from './Comment';

export const CommentList = ({ allComments, pinId, parentId }) => {
    const comments = useMemo(() => {
        return allComments
            .filter(comment => comment.parentComment === parentId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }, [allComments, parentId]);

    if (!comments.length) {
        return null;
    }

    return (
        <div className="grid gap-4">
            {comments.map(comment => (
                <Comment
                    key={comment._id}
                    comment={comment}
                    allComments={allComments}
                    pinId={pinId}
                />
            ))}
        </div>
    );
};