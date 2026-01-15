import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getAircraftById, getManualAppsByAircraft } from '../services/api';
import { FiBook, FiExternalLink } from 'react-icons/fi';
import './Aircraft.css';

const Aircraft = () => {
  const { customerId, aircraftId } = useParams();
  const navigate = useNavigate();
  const [aircraft, setAircraft] = useState(null);
  const [manualApps, setManualApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [aircraftId]);

  const fetchData = async () => {
    try {
      const [aircraftResponse, manualAppsResponse] = await Promise.all([
        getAircraftById(aircraftId),
        getManualAppsByAircraft(aircraftId)
      ]);
      setAircraft(aircraftResponse.data);
      setManualApps(manualAppsResponse.data);
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
    <div className="aircraft-container">
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span> / </span>
        <Link to={`/customer/${customerId}`}>{aircraft?.customer?.name}</Link>
        <span> / </span>
        <span>{aircraft?.name}</span>
      </nav>

      <div className="page-header">
        <h1>{aircraft?.name} - Manuals</h1>
        <p>Click on a manual to open the application</p>
      </div>

      {manualApps.length === 0 ? (
        <div className="empty-state">
          <h3>No manuals available for this aircraft</h3>
        </div>
      ) : (
        <div className="manuals-list">
          {manualApps.map((app) => (
            <div
              key={app.id}
              className="manual-card"
              onClick={() => navigate(`/manual/${app.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="manual-icon"><FiBook /></div>
              <div className="manual-content">
                <div className="manual-header">
                  <h2>{app.title}</h2>
                  <span className="external-icon"><FiExternalLink /></span>
                </div>
                <div className="manual-details">
                  {app.is_active ? (
                    <span className="status-active">Active</span>
                  ) : (
                    <span className="status-inactive">Inactive</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Aircraft;
