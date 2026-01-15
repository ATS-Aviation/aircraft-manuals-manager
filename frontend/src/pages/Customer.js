import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCustomer, getAircraftByCustomer } from '../services/api';
import { FiNavigation, FiArrowRight } from 'react-icons/fi';
import './Customer.css';

const Customer = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [customerResponse, aircraftResponse] = await Promise.all([
        getCustomer(id),
        getAircraftByCustomer(id)
      ]);
      setCustomer(customerResponse.data);
      setAircraft(aircraftResponse.data);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="customer-container">
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span> / </span>
        <span>{customer?.name}</span>
      </nav>

      <div className="page-header">
        <h1>{customer?.name}</h1>
        <p>Select an aircraft to view manuals</p>
      </div>

      {aircraft.length === 0 ? (
        <div className="empty-state">
          <h3>No aircraft available for this customer</h3>
        </div>
      ) : (
        <div className="aircraft-grid">
          {aircraft.map((item) => (
            <Link
              key={item.id}
              to={`/customer/${id}/aircraft/${item.id}`}
              className="aircraft-card"
            >
              <div className="card-icon"><FiNavigation /></div>
              <h2>{item.name}</h2>
              <p className="view-link">View Manuals <FiArrowRight /></p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Customer;
