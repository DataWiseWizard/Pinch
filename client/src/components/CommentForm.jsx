import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon } from 'lucide-react';

export const CommentForm = ({
    onSubmit,
    isLoading,
    initialText = "",
    placeholder = "Add a comment...",
    submitLabel = "Post"
}) => {
    const [text, setText] = useState(initialText);
    const canSubmit = text.trim().length > 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit(text);
        setText("");
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className="w-full"
                rows={2}
            />
            <div className="flex justify-end gap-2">
                {/* A "Cancel" button can be added here if needed, especially for "Edit" forms */}
                <Button
                    type="submit"
                    disabled={!canSubmit || isLoading}
                >
                    {isLoading ? (
                        <p className="mr-2 h-4 w-4 animate-spin" >Loading...</p>
                    ) : null}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
};