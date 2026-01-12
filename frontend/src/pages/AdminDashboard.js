import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, getAircraft, getManualApps, deleteCustomer, deleteAircraft, deleteManualApp, reloadNginx } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [aircraft, setAircraft] = useState([]);
  const [manualApps, setManualApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('customers');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, aircraftRes, appsRes] = await Promise.all([
        getCustomers(),
        getAircraft(),
        getManualApps()
      ]);
      setCustomers(customersRes.data);
      setAircraft(aircraftRes.data);
      setManualApps(appsRes.data);
    } catch (err) {
      showMessage('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Delete this customer? All associated aircraft and manuals will be deleted.')) return;
    try {
      await deleteCustomer(id);
      showMessage('success', 'Customer deleted successfully');
      fetchData();
    } catch (err) {
      showMessage('error', 'Failed to delete customer');
    }
  };

  const handleDeleteAircraft = async (id) => {
    if (!window.confirm('Delete this aircraft? All associated manuals will be deleted.')) return;
    try {
      await deleteAircraft(id);
      showMessage('success', 'Aircraft deleted successfully');
      fetchData();
    } catch (err) {
      showMessage('error', 'Failed to delete aircraft');
    }
  };

  const handleDeleteManualApp = async (id) => {
    if (!window.confirm('Delete this manual app?')) return;
    try {
      await deleteManualApp(id);
      showMessage('success', 'Manual app deleted successfully');
      fetchData();
    } catch (err) {
      showMessage('error', 'Failed to delete manual app');
    }
  };

  const handleReloadNginx = async () => {
    try {
      const response = await reloadNginx();
      if (response.data.success) {
        showMessage('success', response.data.message);
      } else {
        showMessage('error', response.data.message);
      }
    } catch (err) {
      showMessage('error', 'Failed to reload nginx');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <button onClick={handleReloadNginx} className="btn btn-secondary">
            🔄 Reload Nginx
          </button>
          <Link to="/" className="btn btn-outline">← Back to Home</Link>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          Customers ({customers.length})
        </button>
        <button
          className={`tab ${activeTab === 'aircraft' ? 'active' : ''}`}
          onClick={() => setActiveTab('aircraft')}
        >
          Aircraft ({aircraft.length})
        </button>
        <button
          className={`tab ${activeTab === 'manuals' ? 'active' : ''}`}
          onClick={() => setActiveTab('manuals')}
        >
          Manual Apps ({manualApps.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'customers' && (
          <div className="section">
            <div className="section-header">
              <h2>Customers</h2>
              <Link to="/admin/customer/add" className="btn btn-primary">+ Add Customer</Link>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.name}</td>
                      <td><code>{customer.slug}</code></td>
                      <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'aircraft' && (
          <div className="section">
            <div className="section-header">
              <h2>Aircraft</h2>
              <Link to="/admin/aircraft/add" className="btn btn-primary">+ Add Aircraft</Link>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Customer</th>
                    <th>Slug</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {aircraft.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.customer.name}</td>
                      <td><code>{item.slug}</code></td>
                      <td>{new Date(item.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteAircraft(item.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'manuals' && (
          <div className="section">
            <div className="section-header">
              <h2>Manual Apps</h2>
              <Link to="/admin/manual-app/add" className="btn btn-primary">+ Add Manual App</Link>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Aircraft</th>
                    <th>Port</th>
                    <th>URL Path</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manualApps.map((app) => (
                    <tr key={app.id}>
                      <td>{app.title}</td>
                      <td>{app.aircraft.customer.name} - {app.aircraft.name}</td>
                      <td>{app.backend_port}</td>
                      <td><code>{app.url_path}</code></td>
                      <td>
                        <span className={`status ${app.is_active ? 'active' : 'inactive'}`}>
                          {app.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteManualApp(app.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
