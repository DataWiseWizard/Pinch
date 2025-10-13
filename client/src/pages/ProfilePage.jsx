import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import { useAuth } from '../context/AuthContext';
import Pin from '../components/Pin';
import '../components/PinList.css'; 

const ProfilePage = () => {
    const { currentUser } = useAuth();
    const [userPins, setUserPins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            const fetchUserPins = async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`/pins/user/${currentUser._id}`);
                    if (!response.ok) {
                        throw new Error('Could not fetch user pins.');
                    }
                    const data = await response.json();
                    setUserPins(data);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUserPins();
        }
    }, [currentUser]);

    if (loading) {
        return <p>Loading profile...</p>;
    }
    
    if (!currentUser) {
        return <p>Please log in to see your profile.</p>
    }

    const breakpointColumnsObj = {
        default: 4,
        1100: 3,
        700: 2,
        500: 1
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <img src={currentUser.profileImage} alt={currentUser.username} style={{ width: '120px', height: '120px', borderRadius: '50%' }} />
                <h1>{currentUser.username}</h1>
            </div>
            
            <h2>Your Pins</h2>
            {userPins.length > 0 ? (
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {userPins.map(pin => (
                        <Pin key={pin._id} pin={pin} />
                    ))}
                </Masonry>
            ) : (
                <p>You haven't created any pins yet.</p>
            )}
        </div>
    );
};

export default ProfilePage;