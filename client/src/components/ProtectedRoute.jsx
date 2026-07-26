import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Route protection wrapper component.
 * Restricts access to authenticated users only.
 */
const ProtectedRoute = ({ user, loading, children }) => {
  // If user details are still loading from the API, show a loading placeholder
  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Checking authorization...</div>
      </div>
    );
  }

  // If no user is logged in and no token exists in local storage, redirect to login page
  if (!user && !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated, render the nested children pages
  return children;
};

export default ProtectedRoute;
