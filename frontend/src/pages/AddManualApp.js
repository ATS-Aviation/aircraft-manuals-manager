import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createManualApp, getAircraft } from '../services/api';
import './AdminForms.css';

const AddManualApp = () => {
  const [title, setTitle] = useState('');
  const [backendPort, setBackendPort] = useState('');
  const [backendHost, setBackendHost] = useState('localhost');
  const [aircraftId, setAircraftId] = useState('');
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAircraft();
  }, []);

  const fetchAircraft = async () => {
    try {
      const response = await getAircraft();
      setAircraft(response.data);
      if (response.data.length > 0) {
        setAircraftId(response.data[0].id);
      }
    } catch (err) {
      setError('Failed to load aircraft');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createManualApp({
        title,
        backend_port: parseInt(backendPort),
        backend_host: backendHost,
        aircraft_id: parseInt(aircraftId)
      });
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create manual app');
    } finally {
      setLoading(false);
    }
  };

  if (aircraft.length === 0) {
    return (
      <div className="form-container">
        <div className="alert alert-warning">
          No aircraft available. Please create an aircraft first.
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
        <h1>Add Manual App</h1>
        <button onClick={() => navigate('/admin')} className="btn btn-outline">
          ← Back
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="aircraft">Aircraft *</label>
          <select
            id="aircraft"
            value={aircraftId}
            onChange={(e) => setAircraftId(e.target.value)}
            required
            disabled={loading}
          >
            {aircraft.map((item) => (
              <option key={item.id} value={item.id}>
                {item.customer.name} - {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="title">Manual Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Maintenance Manual"
            required
            disabled={loading}
            autoFocus
          />
          <small>The URL path will be automatically generated</small>
        </div>

        <div className="form-group">
          <label htmlFor="backendPort">Backend Port *</label>
          <input
            type="number"
            id="backendPort"
            value={backendPort}
            onChange={(e) => setBackendPort(e.target.value)}
            placeholder="e.g., 8080"
            min="1024"
            max="65535"
            required
            disabled={loading}
          />
          <small>Port number where the manual web app is running (1024-65535)</small>
        </div>

        <div className="form-group">
          <label htmlFor="backendHost">Backend Host</label>
          <input
            type="text"
            id="backendHost"
            value={backendHost}
            onChange={(e) => setBackendHost(e.target.value)}
            placeholder="localhost"
            disabled={loading}
          />
          <small>Hostname or IP where the manual app is running (default: localhost)</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Manual App'}
          </button>
          <button type="button" onClick={() => navigate('/admin')} className="btn btn-outline">
            Cancel
          </button>
        </div>
      </form>

      <div className="info-box">
        <h3>ℹ️ What is a Manual App?</h3>
        <p>
          A Manual App is a web application running on a specific port on your server. 
          This system will create an nginx reverse proxy that makes the app accessible 
          through a clean URL path like: <code>/manuals/customer-name/aircraft-name/manual-title/</code>
        </p>
      </div>
    </div>
  );
};

export default AddManualApp;
