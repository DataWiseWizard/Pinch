// client/src/components/PinList.jsx

import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import Pin from './Pin';
import './PinList.css'; // We'll create this file next

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
        <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
        >
            {pins.map(pin => (
                <Pin key={pin._id} pin={pin} />
            ))}
        </Masonry>
    );
};

export default PinList;