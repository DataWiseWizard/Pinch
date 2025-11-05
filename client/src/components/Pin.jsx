import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Heart, Trash2 } from 'lucide-react';
// import Card from '@mui/material/Card';
// import CardMedia from '@mui/material/CardMedia';
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';
// import Link from '@mui/material/Link';
// import IconButton from '@mui/material/IconButton';
// import DeleteIcon from '@mui/icons-material/Delete';
// import CheckIcon from '@mui/icons-material/Check';

const Pin = ({ pin, onDelete, onSave, isSaved }) => {
    const handleDeleteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDelete) {
            if (window.confirm(`Are you sure you want to delete "${pin.title}"?`)) {
                onDelete(pin._id);
            }
        }
    };

    const handleSaveClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSave) {
            onSave(pin._id, !isSaved);
        }
    };

    //new and updated way
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            whileHover={{ y: -5 }}
        >
            <Card className="relative rounded-2xl overflow-hidden group">
                <RouterLink to={`/pins/${pin._id}`} className="cursor-pointer">
                    <img
                        src={pin.image.url}
                        alt={pin.title}
                        className="block w-full h-auto"
                    />
                    <div
                        className="
                            absolute inset-0 bg-black/50 text-white
                            flex flex-col justify-between p-4
                            opacity-0 transition-opacity duration-300
                            group-hover:opacity-100
                        "
                    >
                        <div className="flex justify-end">
                            {onSave && (
                                <>
                                    {isSaved ? (<Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleSaveClick}
                                        className="rounded-full"
                                    >
                                        <Check className="mr-2 h-4 w-4" /> Saved
                                    </Button>) : (
                                        // `variant="destructive"` is red, like the original "Save" button
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleSaveClick}
                                            className="rounded-full"
                                        >
                                            <Heart className="mr-2 h-4 w-4" /> Save
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                        <div>
                            {pin.postedBy?.username && (
                                <p className="text-sm font-medium">
                                    {pin.postedBy.username}
                                </p>
                            )}
                        </div>
                    </div>
                </RouterLink>
                
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

            </Card>
        </motion.div>
    )


    //old mui way
    // return (
    //     <Card sx={{
    //         position: 'relative',
    //         borderRadius: 4,
    //         cursor: 'pointer',
    //         overflow: 'hidden',
    //         '&:hover .pin-overlay': {
    //             opacity: 1,
    //         }
    //     }}>

    //         <Link component={RouterLink} to={`/pins/${pin._id}`} underline="none">
    //             <CardMedia
    //                 component="img"
    //                 image={pin.image.url}
    //                 alt={pin.title}
    //                 sx={{ display: 'block', width: '100%' }}
    //             />

    //             <Box
    //                 className="pin-overlay"
    //                 sx={{
    //                     position: 'absolute',
    //                     top: 0,
    //                     left: 0,
    //                     width: '100%',
    //                     height: '100%',
    //                     bgcolor: 'rgba(0, 0, 0, 0.5)',
    //                     color: 'white',
    //                     display: 'flex',
    //                     flexDirection: 'column',
    //                     justifyContent: 'space-between',
    //                     p: 2,
    //                     opacity: 0,
    //                     transition: (theme) => theme.transitions.create('opacity', {
    //                         duration: theme.transitions.duration.short,
    //                     }),
    //                 }}
    //             >
    //                 {/* Header section of overlay */}
    //                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    //                     <Box sx={{ flexGrow: 1 }} />

    //                     {onSave && (
    //                         <Button
    //                             variant="contained"
    //                             size="small"
    //                             sx={{
    //                                 bgcolor: isSaved ? 'grey.700' : '#e60023', 
    //                                 color: 'white',
    //                                 borderRadius: '20px',
    //                                 minWidth: 'auto',
    //                                 px: 1.5,
    //                                 '&:hover': { bgcolor: isSaved ? 'grey.700' : '#ad081b' }
    //                             }}
    //                             onClick={handleSaveClick}
    //                             startIcon={isSaved ? <CheckIcon fontSize="small" /> : null} // Show checkmark if saved
    //                         >
    //                             {isSaved ? "Saved" : "Save"}
    //                         </Button>
    //                     )}



    //                 </Box>
    //                 {/* Footer section of overlay */}
    //                 <Box>
    //                     <Typography variant="caption">
    //                         {pin.postedBy?.username}
    //                     </Typography>
    //                 </Box>
    //             </Box>
    //         </Link>


    //         {
    //             onDelete && (
    //                 <IconButton
    //                     aria-label="delete pin"
    //                     className="delete-button"
    //                     onClick={handleDeleteClick}
    //                     sx={{
    //                         position: 'absolute',
    //                         bottom: 8,
    //                         right: 8,
    //                         color: 'white',
    //                         bgcolor: 'rgba(0, 0, 0, 0.4)',
    //                         opacity: 0.7,
    //                     }}
    //                     size="small"
    //                 >
    //                     <DeleteIcon fontSize="small" />
    //                 </IconButton>
    //             )
    //         }
    //     </Card >
    // );
};

export default Pin;