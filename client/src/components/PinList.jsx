// client/src/components/PinList.jsx

import React, { useState, useEffect } from 'react';
import Pin from './Pin';

import Masonry from '@mui/lab/Masonry';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const PinList = () => {
    const [pins, setPins] = useState([]);

    useEffect(() => {

        const fetchPins = async () => {
            try {
                const response = await fetch('/pins'); // Adjust the URL if needed
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPins(data);
            } catch (error) {
                console.error('Error fetching pins:', error);
            }
        };

        fetchPins();
    }, []);

    const breakpointColumnsObj = {
        default: 4,
        1100: 3,
        700: 2,
        500: 1
    };



    return (
        <Box sx={{ width: 'auto', p: 1 }}> 
            <Masonry
                columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} 
                spacing={2} 
            >
                {pins.map(pin => (
                    // Each child needs a key
                    <div key={pin._id}>
                        <Pin pin={pin} />
                    </div>
                ))}
            </Masonry>
        </Box>
    );
};

export default PinList;