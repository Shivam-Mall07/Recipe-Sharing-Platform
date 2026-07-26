import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

/**
 * Footer component displayed at the bottom of pages.
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo">
              <span className="logo-emoji">🍳</span>
              <span className="logo-text">Flavor<span className="accent">Share</span></span>
            </Link>
            <p className="footer-desc">
              Discover, cook, and share your favorite recipes from around the globe. Join our passionate community of home chefs and foodies.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="footer-col">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>

          {/* Categories Column */}
          <div className="footer-col">
            <h4 className="footer-title">Recipe Categories</h4>
            <ul className="footer-links">
              <li><Link to="/?category=Breakfast">Breakfast</Link></li>
              <li><Link to="/?category=Lunch">Lunch</Link></li>
              <li><Link to="/?category=Dinner">Dinner</Link></li>
              <li><Link to="/?category=Dessert">Dessert</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FlavorShare. Built for College Internship Evaluation. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
