import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getManualAppById } from '../services/api';
import './ManualViewer.css';

const ManualViewer = () => {
  const { manualId } = useParams();
  const [manual, setManual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchManual();
  }, [manualId]);

  const fetchManual = async () => {
    try {
      const response = await getManualAppById(manualId);
      setManual(response.data);
    } catch (err) {
      setError('Failed to load manual');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading manual...</div>;
  }

  if (error) {
    return (
      <div className="manual-viewer-error">
        <div className="error-content">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!manual || !manual.iframe_url) {
    return (
      <div className="manual-viewer-error">
        <div className="error-content">
          <h2>Manual Not Available</h2>
          <p>This manual does not have a configured URL.</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="manual-viewer">
      <div className="manual-viewer-header">
        <button onClick={() => navigate(-1)} className="btn btn-back">
          Back
        </button>
        <h1>{manual.title}</h1>
      </div>
      <div className="manual-viewer-content">
        <iframe
          src={manual.iframe_url}
          title={manual.title}
          className="manual-iframe"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default ManualViewer;
