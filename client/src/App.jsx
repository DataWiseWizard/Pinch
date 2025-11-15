import React from 'react'; import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import PinDetail from './pages/PinDetail';
import PinCreate from './pages/PinCreate';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import GoogleCallback from './pages/GoogleCallback';
import ProtectedRoute from './components/ProtectedRoute';
import VerifyEmailPage from './pages/VerifyEmailPage';
import BoardDetailPage from './pages/BoardDetailPage';
import { Toaster } from "@/components/ui/sonner";
import './App.css';

function App() {
  return (
    <Router>
      <div className='bg-gray-900 text-gray-200 min-h-screen'>
        <NavBar />
        <Toaster richColors />
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<GoogleCallback />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/pins/:id" element={<PinDetail />} />
            <Route
              path="/pins/new"
              element={
                <ProtectedRoute>
                  <PinCreate />
                </ProtectedRoute>
              } />
            <Route
              path="/board/:boardId"
              element={
                <ProtectedRoute>
                  <BoardDetailPage />
                </ProtectedRoute>
              }
            />
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