import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/sonner";
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const PinDetail = lazy(() => import('./pages/PinDetail'));
const PinCreate = lazy(() => import('./pages/PinCreate'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const BoardDetailPage = lazy(() => import('./pages/BoardDetailsPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));

const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
  </div>
);

function App() {
  return (
    <Router>
      <div className='bg-gray-900 text-gray-200 min-h-screen'>
        <NavBar />
        <Toaster richColors />
        <div className="App">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<GoogleCallback />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/pins/:id" element={<PinDetail />} />
              <Route path="/user/:username" element={<UserProfilePage />} />
              <Route path="/search" element={<SearchPage />} />
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

          </Suspense>
        </div>
      </div>
    </Router>
  );

}

export default App;