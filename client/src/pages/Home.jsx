import React from 'react';
import { Link } from 'react-router-dom';
import PinList from '../components/PinList';

const Home = () => {
    return (
        <div>
            <h1>Pinch</h1>
            <Link to="/pins/new">
                <button>Create Pin</button>
            </Link>
            <PinList />
        </div>
    );
};

export default Home;