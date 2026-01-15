import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiHome, FiSettings, FiUser, FiLogOut } from 'react-icons/fi';
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
          <img
            src="https://atsaviation.com/wp-content/uploads/2024/11/Technik.png"
            alt="ATS Technic"
            className="navbar-logo"
          />
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link"><FiHome /> Home</Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="navbar-link"><FiSettings /> Admin</Link>
          )}
          <div className="navbar-user">
            <span><FiUser /> {user.username}</span>
            <button onClick={handleLogout} className="btn btn-sm btn-outline">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
