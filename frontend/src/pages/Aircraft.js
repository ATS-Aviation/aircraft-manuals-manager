import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAircraftById, getManualAppsByAircraft } from '../services/api';
import './Aircraft.css';

const Aircraft = () => {
  const { customerId, aircraftId } = useParams();
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
            <a
              key={app.id}
              href={app.url_path}
              target="_blank"
              rel="noopener noreferrer"
              className="manual-card"
            >
              <div className="manual-header">
                <h2>{app.title}</h2>
                <span className="external-icon">↗</span>
              </div>
              <div className="manual-details">
                <p className="manual-path">{app.url_path}</p>
                <p className="manual-port">Port: {app.backend_port}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Aircraft;
