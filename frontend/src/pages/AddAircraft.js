import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAircraft, getCustomers } from '../services/api';
import './AdminForms.css';

const AddAircraft = () => {
  const [name, setName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data);
      if (response.data.length > 0) {
        setCustomerId(response.data[0].id);
      }
    } catch (err) {
      setError('Failed to load customers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createAircraft({ name, customer_id: parseInt(customerId) });
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create aircraft');
    } finally {
      setLoading(false);
    }
  };

  if (customers.length === 0) {
    return (
      <div className="form-container">
        <div className="alert alert-warning">
          No customers available. Please create a customer first.
        </div>
        <button onClick={() => navigate('/admin')} className="btn btn-outline">
          ← Back to Admin
        </button>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Add Aircraft</h1>
        <button onClick={() => navigate('/admin')} className="btn btn-outline">
          ← Back
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="customer">Customer *</label>
          <select
            id="customer"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
            disabled={loading}
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="name">Aircraft Name *</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Boeing 737-800"
            required
            disabled={loading}
            autoFocus
          />
          <small>A URL-friendly slug will be automatically generated</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Aircraft'}
          </button>
          <button type="button" onClick={() => navigate('/admin')} className="btn btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAircraft;
