import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div>
          <div className="navbar-logo">
            Nritya<span>Kala</span>
          </div>
          <div className="navbar-tagline">NrityaKala - Art of Dance</div>
        </div>
      </div>

      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Home
        </NavLink>
        <NavLink to="/mudras" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Mudras
        </NavLink>
        {user && (
          <>
            <NavLink to="/practice" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Practice
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              History
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Profile
            </NavLink>
            <button onClick={handleLogout} className="nav-btn" style={{ marginLeft: '8px' }}>
              Sign Out
            </button>
          </>
        )}
        {!user && (
          <button onClick={() => navigate('/login')} className="nav-btn" style={{ marginLeft: '8px' }}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;