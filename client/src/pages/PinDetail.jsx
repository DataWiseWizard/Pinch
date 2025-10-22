import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const PinDetail = () => {
    const { id } = useParams();
    const [pin, setPin] = useState(null);

    useEffect(() => {
        const fetchPin = async () => {
            try {
                const response = await fetch(`/pins/${id}`);
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
        <div className='pin-detail-container'>
            <div className="pin-detail-info">
                <h2>{pin.title}</h2>
                <div className="pin-detail-image"><img src={pin.image.url} alt={pin.title} style={{ maxWidth: '500px' }} /></div>
                <p>{pin.destination}</p>
                <p>Posted by: {pin.postedBy?.username}</p>
            </div>
        </div>
    );
};

export default PinDetail;