// client/src/App.jsx

import React from 'react';
// import PinList from './components/PinList';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import PinDetail from './pages/PinDetail';
import PinCreate from './pages/PinCreate';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute'
import './App.css';

function App() {
  return (
    <Router>
      <div className='bg-gray-900 text-gray-200 min-h-screen'>
        <NavBar />
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pins/:id" element={<PinDetail />} />
            <Route
              path="/pins/new"
              element={
                <ProtectedRoute>
                  <PinCreate />
                </ProtectedRoute>
              } />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
          </Routes>
        </div>
      </div>

    </Router>
  );

}

export default App;