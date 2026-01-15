import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, getAircraft, getManualApps, deleteCustomer, deleteAircraft, deleteManualApp, updateCustomer, updateAircraft, updateManualApp } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [aircraft, setAircraft] = useState([]);
  const [manualApps, setManualApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('customers');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Edit modal states
  const [editModal, setEditModal] = useState({ type: null, item: null });
  const [editForm, setEditForm] = useState({});

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

  // Open edit modal
  const openEditModal = (type, item) => {
    setEditModal({ type, item });
    if (type === 'customer') {
      setEditForm({ name: item.name });
    } else if (type === 'aircraft') {
      setEditForm({ name: item.name });
    } else if (type === 'manual') {
      setEditForm({ title: item.title, iframe_url: item.iframe_url || '' });
    }
  };

  const closeEditModal = () => {
    setEditModal({ type: null, item: null });
    setEditForm({});
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editModal.type === 'customer') {
        await updateCustomer(editModal.item.id, { name: editForm.name });
        showMessage('success', 'Customer updated successfully');
      } else if (editModal.type === 'aircraft') {
        await updateAircraft(editModal.item.id, { name: editForm.name });
        showMessage('success', 'Aircraft updated successfully');
      } else if (editModal.type === 'manual') {
        await updateManualApp(editModal.item.id, {
          title: editForm.title,
          iframe_url: editForm.iframe_url
        });
        showMessage('success', 'Manual app updated successfully');
      }
      closeEditModal();
      fetchData();
    } catch (err) {
      showMessage('error', 'Failed to update');
    }
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <Link to="/" className="btn btn-outline">Back to Home</Link>
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
                      <td className="actions-cell">
                        <button
                          onClick={() => openEditModal('customer', customer)}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </button>
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
                      <td className="actions-cell">
                        <button
                          onClick={() => openEditModal('aircraft', item)}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </button>
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
                    <th>Iframe URL</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manualApps.map((app) => (
                    <tr key={app.id}>
                      <td>{app.title}</td>
                      <td>{app.aircraft.customer.name} - {app.aircraft.name}</td>
                      <td><code>{app.iframe_url || 'Not set'}</code></td>
                      <td>
                        <span className={`status ${app.is_active ? 'active' : 'inactive'}`}>
                          {app.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => openEditModal('manual', app)}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </button>
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

      {/* Edit Modal */}
      {editModal.type && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                Edit {editModal.type === 'customer' ? 'Customer' : editModal.type === 'aircraft' ? 'Aircraft' : 'Manual App'}
              </h2>
              <button className="modal-close" onClick={closeEditModal}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form">
              {editModal.type === 'customer' && (
                <div className="form-group">
                  <label htmlFor="name">Customer Name</label>
                  <input
                    type="text"
                    id="name"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
              )}

              {editModal.type === 'aircraft' && (
                <div className="form-group">
                  <label htmlFor="name">Aircraft Name</label>
                  <input
                    type="text"
                    id="name"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
              )}

              {editModal.type === 'manual' && (
                <>
                  <div className="form-group">
                    <label htmlFor="title">Manual Title</label>
                    <input
                      type="text"
                      id="title"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="iframe_url">Iframe URL</label>
                    <input
                      type="url"
                      id="iframe_url"
                      value={editForm.iframe_url || ''}
                      onChange={(e) => setEditForm({ ...editForm, iframe_url: e.target.value })}
                      placeholder="http://127.0.0.1:8999"
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-outline" onClick={closeEditModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
