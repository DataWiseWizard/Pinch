import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Trash2, X } from 'lucide-react';

const Pin = ({ pin, onSave, isSaved, onAction, actionIcon }) => {
    const handleDeleteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDelete) {
            if (window.confirm(`Are you sure you want to delete "${pin.title}"?`)) {
                onDelete(pin._id);
            }
        }
    };
    
    const handleActionClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAction) {
            // Confirmation logic is now handled by the parent page
            onAction(pin._id);
        }
    };

    const handleSaveClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSave) {
            onSave(pin._id, !isSaved);
        }
    };

    const renderActionIcon = () => {
        if (actionIcon === 'delete') {
            return <Trash2 className="h-4 w-4" />;
        }
        if (actionIcon === 'remove') {
            return <X className="h-4 w-4" />;
        }
        return null;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            whileHover={{ y: -5 }}
            className="relative group"
        >

            <RouterLink to={`/pins/${pin._id}`} className="cursor-pointer">
                <img
                    src={pin.image.url}
                    alt={pin.title}
                    className="block w-full h-auto rounded-2xl overflow-hidden"
                />
                <div
                    className="
                            absolute inset-0 bg-black/50 text-white
                            flex flex-col justify-between
                            opacity-0 transition-opacity duration-300
                            group-hover:opacity-100 rounded-2xl
                        "
                >
                    <div className="flex justify-end p-2">
                        {onSave && (
                            <>
                                {isSaved ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleSaveClick}
                                        className="rounded-full font-semibold"
                                    >
                                        <Check className="mr-1 h-4 w-4" />
                                        Saved
                                    </Button>
                                ) : (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleSaveClick}
                                        className="rounded-full font-semibold"
                                    >
                                        Save
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                    <div>
                        {pin.postedBy?.username && (
                            <p className="text-sm mb-2 ml-2 font-medium">
                                {pin.postedBy.username}
                            </p>
                        )}
                    </div>
                </div>
            </RouterLink>

            {onAction && actionIcon && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleActionClick} // Use the new handler
                    className="
                            absolute bottom-2 right-2 z-10 
                            h-8 w-8 rounded-full 
                            bg-black/40 text-white 
                            opacity-0 transition-opacity 
                            group-hover:opacity-100
                            hover:bg-black/60 hover:text-white
                        "
                >
                    {renderActionIcon()} {/* Render the correct icon */}
                </Button>
            )}

            {onDelete && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDeleteClick}
                    className="
                            absolute bottom-2 right-2 z-10 
                            h-8 w-8 rounded-full 
                            bg-black/40 text-white 
                            opacity-0 transition-opacity 
                            group-hover:opacity-100
                            hover:bg-black/60 hover:text-white
                        "
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}


        </motion.div>
    )
};

export default Pin;