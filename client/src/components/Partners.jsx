import React, { useState, useEffect } from 'react';
import { getPartners } from '../services/partnerService';
import './Partners.css';

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const data = await getPartners();
        setPartners(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching partners:', error);
        if (error.name === 'PartnerServiceError') {
          if (error.message.includes('Database connection')) {
            setError('The server is currently unable to access the database. Please try again later.');
          } else if (error.message.includes('Network error')) {
            setError('Unable to connect to the server. Please check your internet connection and try again.');
          } else {
            setError(error.message || 'Failed to load partners. Please try again later.');
          }
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <section className="partners-section">
        <div className="container">
          <h2 className="section-title">Our Partners</h2>
          <div className="loading-spinner">Loading partners...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="partners-section">
        <div className="container">
          <h2 className="section-title">Our Partners</h2>
          <div className="error-message">
            <p>{error}</p>
            <button 
              className="retry-button" 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return (
      <section className="partners-section">
        <div className="container">
          <h2 className="section-title">Our Partners</h2>
          <p className="no-partners-message">No partners available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="partners-section">
      <div className="container">
        <h2 className="section-title">Our Partners</h2>
        <div className="partners-grid">
          {partners.map((partner) => (
            <a
              key={partner._id}
              href={partner.link}
              target="_blank"
              rel="noopener noreferrer"
              className="partner-card"
            >
              <img
                src={partner.image}
                alt={partner.name}
                className="partner-logo"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/200x100?text=Partner';
                  e.target.alt = 'Partner logo unavailable';
                }}
              />
              <h3 className="partner-name">{partner.name}</h3>
              {partner.description && (
                <p className="partner-description">{partner.description}</p>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners; 