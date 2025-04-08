import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './DatabaseStatusIndicator.css';

const DatabaseStatusIndicator = () => {
  const [status, setStatus] = useState('checking'); // 'checking', 'connected', or 'disconnected'
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        // Make a simple request to an endpoint to check database status
        await api.get('/partners', { timeout: 5000 });
        setStatus('connected');
        // Hide the indicator after 5 seconds of successful connection
        setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      } catch (error) {
        if (error.response && error.response.status === 503) {
          // 503 Service Unavailable indicates database connection issue
          setStatus('disconnected');
          setIsVisible(true);
        } else if (!error.response) {
          // Network error indicates server is unreachable
          setStatus('disconnected');
          setIsVisible(true);
        } else {
          // Any other status means the server is running but might have other issues
          setStatus('connected');
          // Hide after 5 seconds
          setTimeout(() => {
            setIsVisible(false);
          }, 5000);
        }
      }
    };

    // Check status immediately and then every 30 seconds
    checkDatabaseStatus();
    const intervalId = setInterval(checkDatabaseStatus, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Don't render anything if status is 'checking' or not visible
  if (status === 'checking' || !isVisible) {
    return null;
  }

  return (
    <div className={`database-status-indicator ${status}`}>
      {status === 'connected' ? (
        <>
          <span className="status-icon">✓</span>
          <span className="status-text">Connected to database</span>
        </>
      ) : (
        <>
          <span className="status-icon">!</span>
          <span className="status-text">
            Database unavailable. Some features may not work properly.
          </span>
        </>
      )}
      <button className="close-button" onClick={() => setIsVisible(false)}>
        ×
      </button>
    </div>
  );
};

export default DatabaseStatusIndicator; 