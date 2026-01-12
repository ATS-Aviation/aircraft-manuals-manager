import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          ✈️ Aircraft Manuals Manager
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Home</Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="navbar-link">Admin</Link>
          )}
          <div className="navbar-user">
            <span>{user.username}</span>
            <button onClick={handleLogout} className="btn btn-sm btn-outline">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
