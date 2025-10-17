// client/src/components/Pin.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './Pin.css';

const Pin = ({ pin }) => {
    return (
        <div className="pin-container">
            <Link to={`/pins/${pin._id}`}>
                <img src={pin.image.url} alt={pin.title} />
                <div className="pin-overlay">
                    <div className="pin-header">
                        <p>{pin.title}</p>
                        <button className="save-button">Save</button>
                    </div>
                    <div className="pin-footer">
                        <p>{pin.postedBy?.username}</p>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default Pin;