import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import API_URL from '../apiConfig';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid'; 


const PinDetail = () => {
    const { id } = useParams();
    const [pin, setPin] = useState(null);

    useEffect(() => {
        const fetchPin = async () => {
            try {
                const response = await fetch(`${API_URL}/pins/${id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPin(data);
            } catch (error) {
                console.error('Error fetching pin:', error);
            }
        };

        fetchPin();
    }, [id]);

    if (!pin) {
        return <div>Loading...</div>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Using Grid container for layout */}
            <Grid container spacing={3} justifyContent="center">
                {/* Image Grid Item - takes up more space on larger screens */}
                <Grid item xs={12} md={7} lg={8}>
                    <Box sx={{
                        width: '100%',
                        borderRadius: 4, // Add rounded corners to the image container
                        overflow: 'hidden', // Ensure image respects border radius
                        // Optional: Add a subtle border or background if needed on dark theme
                        // border: `1px solid ${theme.palette.divider}`
                    }}>
                        <img
                            src={pin.image.url}
                            alt={pin.title}
                            style={{
                                display: 'block',
                                width: '100%',
                                height: 'auto',
                                maxHeight: '85vh', // Limit max height
                                objectFit: 'contain' // Ensure whole image is visible
                            }}
                        />
                    </Box>
                </Grid>

                {/* Details Grid Item */}
                <Grid item xs={12} md={5} lg={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pl: { md: 2 } }}> {/* Add padding left on medium+ screens */}
                        <Typography variant="h4" component="h1" gutterBottom sx={{ wordBreak: 'break-word' }}>
                            {pin.title}
                        </Typography>

                        {/* Display Destination as plain text */}
                        {pin.destination && (
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, wordBreak: 'break-all' }}>
                                {/* Label added for clarity */}
                                From: {pin.destination}
                            </Typography>
                        )}

                        {/* Spacer to push 'Posted by' to the bottom */}
                        <Box sx={{ flexGrow: 1 }} />

                        {/* Posted By Information */}
                        {pin.postedBy && (
                            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}> {/* Added top margin */}
                                Posted by: {' '}
                                <Link component={RouterLink} to={`/user/${pin.postedBy._id}`} underline="hover" color="inherit">
                                    {pin.postedBy.username}
                                </Link>
                            </Typography>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default PinDetail;