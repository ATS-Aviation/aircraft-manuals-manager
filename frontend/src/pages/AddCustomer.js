import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomer } from '../services/api';
import './AdminForms.css';

const AddCustomer = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createCustomer({ name });
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Add Customer</h1>
        <button onClick={() => navigate('/admin')} className="btn btn-outline">
          ← Back
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="name">Customer Name *</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., ATS Aviation"
            required
            disabled={loading}
            autoFocus
          />
          <small>A URL-friendly slug will be automatically generated</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Customer'}
          </button>
          <button type="button" onClick={() => navigate('/admin')} className="btn btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCustomer;
