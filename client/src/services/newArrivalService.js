import api from './api';

class NewArrivalServiceError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
    super(message);
    this.name = 'NewArrivalServiceError';
    this.code = code;
    this.details = details;
  }
}

const API_URL = '/new-arrivals';

// Get all new arrivals
export const getNewArrivals = async () => {
  try {
    const response = await api.get(API_URL);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new NewArrivalServiceError(
        error.response.data.message || 'Failed to fetch new arrivals',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new NewArrivalServiceError(
      'Network error while fetching new arrivals',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

// Get a single new arrival by ID
export const getNewArrivalById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new NewArrivalServiceError(
        error.response.data.message || 'Failed to fetch new arrival',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new NewArrivalServiceError(
      'Network error while fetching new arrival',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

// Get all new arrivals for admin
export async function getAdminNewArrivals() {
  try {
    const response = await api.get(`${API_URL}/admin`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin new arrivals:', error);
    
    // Check for token issues
    if (error.response?.status === 401) {
      // Try to refresh the token if that's implemented
      throw new NewArrivalServiceError(
        'Authentication error: Not authorized, please log in again.',
        'AUTH_ERROR',
        { status: error.response?.status }
      );
    }
    
    throw new NewArrivalServiceError(
      `Failed to fetch admin new arrivals: ${error.response?.data?.message || error.message}`,
      'FETCH_ERROR',
      { status: error.response?.status, details: error.response?.data }
    );
  }
}

// Create a new arrival
export const createNewArrival = async (formData) => {
  try {
    const response = await api.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new NewArrivalServiceError(
        error.response.data.message || 'Failed to create new arrival',
        'CREATE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new NewArrivalServiceError(
      'Network error while creating new arrival',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

// Update a new arrival
export const updateNewArrival = async (id, formData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new NewArrivalServiceError(
        error.response.data.message || 'Failed to update new arrival',
        'UPDATE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new NewArrivalServiceError(
      'Network error while updating new arrival',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

// Delete a new arrival
export const deleteNewArrival = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new NewArrivalServiceError(
        error.response.data.message || 'Failed to delete new arrival',
        'DELETE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new NewArrivalServiceError(
      'Network error while deleting new arrival',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
}; 