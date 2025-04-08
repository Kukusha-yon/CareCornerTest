import { useState, useEffect } from 'react';
import api from '../../services/api';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const DatabaseStatusIndicator = () => {
  const [status, setStatus] = useState('checking'); // 'checking', 'connected', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [lastChecked, setLastChecked] = useState(null);

  const checkDatabaseStatus = async () => {
    try {
      // Use the partners endpoint as a lightweight check
      await api.get('/partners', { showErrorToast: false });
      setStatus('connected');
      setErrorMessage('');
    } catch (error) {
      if (error.response && error.response.status === 503) {
        setStatus('error');
        setErrorMessage('Database connection issue');
      } else if (!error.response) {
        setStatus('error');
        setErrorMessage('Network error');
      } else {
        // Other errors mean the server is responding but there might be other issues
        setStatus('connected');
        setErrorMessage('');
      }
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkDatabaseStatus();

    // Set up interval for periodic checks
    const interval = setInterval(checkDatabaseStatus, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  if (status === 'connected') {
    return null; // Don't show anything when connected
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 rounded-lg shadow-lg p-3 max-w-xs ${
      status === 'checking' ? 'bg-gray-100' : 'bg-red-50'
    }`}>
      <div className="flex items-center">
        {status === 'checking' ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
        ) : status === 'error' ? (
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
        ) : (
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        )}
        
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            status === 'checking' ? 'text-gray-700' : 'text-red-700'
          }`}>
            {status === 'checking' 
              ? 'Checking database connection...' 
              : status === 'error'
                ? 'Database connection issue'
                : 'Connected'
            }
          </p>
          {status === 'error' && (
            <p className="text-xs text-red-600 mt-1">
              {errorMessage || 'Unable to connect to the database. Some features may be unavailable.'}
            </p>
          )}
        </div>
        
        {status === 'error' && (
          <button 
            onClick={() => {
              setStatus('checking');
              checkDatabaseStatus();
            }}
            className="ml-2 text-xs bg-white text-gray-800 hover:bg-gray-100 px-2 py-1 rounded"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default DatabaseStatusIndicator; 