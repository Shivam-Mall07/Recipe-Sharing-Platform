import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import apiService from './services/api';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RecipeForm from './pages/RecipeForm';
import RecipeDetails from './pages/RecipeDetails';
import Profile from './pages/Profile';
import './App.css';

/**
 * Root Application component.
 * Manages routing, user authentication state initialization, and global page structures.
 */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authenticate user on app mount if token exists in localStorage
  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fetch complete profile details (includes recipes and reviews)
          const data = await apiService.getProfile();
          // Store the core user details inside app state
          setUser(data.user);
        } catch (err) {
          console.error('Failed to initialize user session:', err.message);
          // Token expired or invalid, clear localStorage
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeUser();
  }, []);

  // Callback to execute after user logs in or registers successfully
  const handleLoginSuccess = (data) => {
    localStorage.setItem('token', data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email
    });
  };

  // Callback to execute on user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Navigation Bar */}
        <Navbar user={user} handleLogout={handleLogout} />

        {/* Core Content Area */}
        <main className="main-content" style={{ flexGrow: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={<Login handleLoginSuccess={handleLoginSuccess} />} 
            />
            <Route 
              path="/register" 
              element={<Register handleLoginSuccess={handleLoginSuccess} />} 
            />
            <Route path="/recipes/:id" element={<RecipeDetails user={user} />} />

            {/* Protected Routes (Require active authentication) */}
            <Route 
              path="/add-recipe" 
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <RecipeForm user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recipes/:id/edit" 
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <RecipeForm user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <Profile />
                </ProtectedRoute>
              } 
            />

            {/* Fallback 404 Route */}
            <Route 
              path="*" 
              element={
                <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '3rem' }}>🔍</span>
                  <h2 style={{ fontSize: '2rem', marginTop: '16px', color: 'var(--text-main)' }}>404 - Page Not Found</h2>
                  <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px 0' }}>
                    The culinary guide or dashboard section you requested could not be found.
                  </p>
                  <Link to="/" className="btn btn-primary">Back to Home</Link>
                </div>
              } 
            />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
