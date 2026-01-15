import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FiUsers, FiArrowRight } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (err) {
      setError('Failed to load customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome, {user?.username}!</h1>
        <p>Select a customer to view their aircraft manuals</p>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {customers.length === 0 ? (
        <div className="empty-state">
          <h3>No customers available</h3>
          {user?.role === 'admin' && (
            <p>Go to the <Link to="/admin">Admin Panel</Link> to add customers.</p>
          )}
        </div>
      ) : (
        <div className="customers-grid">
          {customers.map((customer) => (
            <Link
              key={customer.id}
              to={`/customer/${customer.id}`}
              className="customer-card"
            >
              <div className="card-icon"><FiUsers /></div>
              <h2>{customer.name}</h2>
              <p className="view-link">View Aircraft <FiArrowRight /></p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
