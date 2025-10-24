// client/src/components/Pin.jsx

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';

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

    return (
        <Card sx={{
            position: 'relative',
            borderRadius: 4,
            cursor: 'pointer',
            overflow: 'hidden',
            '&:hover .pin-overlay': {
                opacity: 1,
            }
        }}>

            <Link component={RouterLink} to={`/pins/${pin._id}`} underline="none">
                <CardMedia
                    component="img"
                    image={pin.image.url}
                    alt={pin.title}
                    sx={{ display: 'block', width: '100%' }}
                />

                <Box
                    className="pin-overlay"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: 2,
                        opacity: 0,
                        transition: (theme) => theme.transitions.create('opacity', {
                            duration: theme.transitions.duration.short,
                        }),
                    }}
                >
                    {/* Header section of overlay */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flexGrow: 1 }} />

                        {/* --- MODIFIED SAVE BUTTON --- */}
                        {/* Only show if onSave is provided */}
                        {onSave && (
                            <Button
                                variant="contained"
                                size="small"
                                // disabled={isSaved} // Disable button if already saved
                                sx={{
                                    bgcolor: isSaved ? 'grey.700' : '#e60023', // Different bg color when saved
                                    color: 'white',
                                    borderRadius: '20px',
                                    minWidth: 'auto',
                                    px: 1.5,
                                    '&:hover': { bgcolor: isSaved ? 'grey.700' : '#ad081b' }
                                }}
                                onClick={handleSaveClick}
                                startIcon={isSaved ? <CheckIcon fontSize="small" /> : null} // Show checkmark if saved
                            >
                                {isSaved ? "Saved" : "Save"}
                            </Button>
                        )}
                        {/* --- END MODIFIED SAVE BUTTON --- */}


                    </Box>
                    {/* Footer section of overlay */}
                    <Box>
                        <Typography variant="caption">
                            {pin.postedBy?.username}
                        </Typography>
                    </Box>
                </Box>
            </Link>


            {
                onDelete && (
                    <IconButton
                        aria-label="delete pin"
                        className="delete-button"
                        onClick={handleDeleteClick}
                        sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            color: 'white',
                            bgcolor: 'rgba(0, 0, 0, 0.4)',
                            opacity: 0.7,
                        }}
                        size="small"
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                )
            }
        </Card >
    );
};

export default Pin;