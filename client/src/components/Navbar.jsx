import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

/**
 * Navbar component for main application navigation.
 * Displays logo, hamburger toggle, and links based on authentication state.
 */
const Navbar = ({ user, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const onLogoutClick = () => {
    handleLogout();
    closeMenu();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-emoji">🍳</span>
          <span className="logo-text">Flavor<span className="accent">Share</span></span>
        </Link>

        {/* Mobile Hamburger Toggle Menu */}
        <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
          <span className={`bar ${isOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isOpen ? 'open' : ''}`}></span>
        </button>

        {/* Navigation Links */}
        <div className={`navbar-links-wrapper ${isOpen ? 'open' : ''}`}>
          <ul className="navbar-links">
            <li>
              <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link to="/add-recipe" className="nav-link" onClick={closeMenu}>Add Recipe</Link>
                </li>
                <li>
                  <Link to="/profile" className="nav-link" onClick={closeMenu}>My Profile</Link>
                </li>
                <li className="nav-user-info">
                  <span className="user-welcome">Hello, <strong>{user.name}</strong></span>
                  <button className="btn btn-outline logout-btn" onClick={onLogoutClick}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
                </li>
                <li>
                  <Link to="/register" className="btn btn-primary register-nav-btn" onClick={closeMenu}>Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
