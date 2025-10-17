// client/src/components/Navbar.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';


const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc' }}>
            <div>
                <Link to="/">Pinch</Link>
                {currentUser && <Link to="/pins/new" style={{ marginLeft: '1rem' }}>Create</Link>}
            </div>
            <div>
                {currentUser ? (
                    <>
                        <Link to="/profile" className='profile' style={{ marginRight: '1rem' }}>
                            {currentUser.username}
                        </Link>
                        <button onClick={handleLogout}>Log Out</button>
                    </>
                ) : (
                    <>
                        <Link to="/signup" style={{ marginLeft: '1rem' }}>Sign Up</Link>
                        <Link to="/login" style={{ marginLeft: '1rem' }}>Log In</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;