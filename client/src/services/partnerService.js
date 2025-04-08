import api from './api';

// Custom error class for partner service errors
export class PartnerServiceError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'PartnerServiceError';
    this.details = details;
  }
}

// Get all partners
export const getPartners = async () => {
  try {
    const response = await api.get('/partners');
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 503) {
      throw new PartnerServiceError(
        'Database connection error, try again later',
        { originalError: error }
      );
    } else if (!error.response) {
      throw new PartnerServiceError(
        'Network error, check your connection',
        { originalError: error }
      );
    } else {
      throw new PartnerServiceError(
        error.response?.data?.message || 'Failed to fetch partners',
        { originalError: error }
      );
    }
  }
};

// Get partner by ID
export const getPartnerById = async (id) => {
  try {
    const response = await api.get(`/partners/${id}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 503) {
      throw new PartnerServiceError(
        'Database connection error, try again later',
        { originalError: error }
      );
    } else if (!error.response) {
      throw new PartnerServiceError(
        'Network error, check your connection',
        { originalError: error }
      );
    } else if (error.response?.status === 404) {
      throw new PartnerServiceError(
        'Partner not found',
        { originalError: error }
      );
    } else {
      throw new PartnerServiceError(
        error.response?.data?.message || 'Failed to fetch partner',
        { originalError: error }
      );
    }
  }
};

// Create partner (admin only)
export const createPartner = async (partnerData) => {
  try {
    const formData = new FormData();
    
    // Add fields to formData
    Object.keys(partnerData).forEach(key => {
      if (key === 'image' && partnerData[key] instanceof File) {
        formData.append('image', partnerData[key]);
      } else if (key === 'seoMetadata' && typeof partnerData[key] === 'object') {
        formData.append(key, JSON.stringify(partnerData[key]));
      } else {
        formData.append(key, partnerData[key]);
      }
    });
    
    const response = await api.post('/partners', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 503) {
      throw new PartnerServiceError(
        'Database connection error, try again later',
        { originalError: error }
      );
    } else if (!error.response) {
      throw new PartnerServiceError(
        'Network error, check your connection',
        { originalError: error }
      );
    } else if (error.response?.status === 401) {
      throw new PartnerServiceError(
        'Authentication required',
        { originalError: error }
      );
    } else if (error.response?.status === 403) {
      throw new PartnerServiceError(
        'You do not have permission to create partners',
        { originalError: error }
      );
    } else {
      throw new PartnerServiceError(
        error.response?.data?.message || 'Failed to create partner',
        { originalError: error }
      );
    }
  }
};

// Update partner (admin only)
export const updatePartner = async (id, partnerData) => {
  try {
    const formData = new FormData();
    
    // Add fields to formData
    Object.keys(partnerData).forEach(key => {
      if (key === 'image' && partnerData[key] instanceof File) {
        formData.append('image', partnerData[key]);
      } else if (key === 'seoMetadata' && typeof partnerData[key] === 'object') {
        formData.append(key, JSON.stringify(partnerData[key]));
      } else {
        formData.append(key, partnerData[key]);
      }
    });
    
    const response = await api.put(`/partners/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 503) {
      throw new PartnerServiceError(
        'Database connection error, try again later',
        { originalError: error }
      );
    } else if (!error.response) {
      throw new PartnerServiceError(
        'Network error, check your connection',
        { originalError: error }
      );
    } else if (error.response?.status === 401) {
      throw new PartnerServiceError(
        'Authentication required',
        { originalError: error }
      );
    } else if (error.response?.status === 403) {
      throw new PartnerServiceError(
        'You do not have permission to update partners',
        { originalError: error }
      );
    } else if (error.response?.status === 404) {
      throw new PartnerServiceError(
        'Partner not found',
        { originalError: error }
      );
    } else {
      throw new PartnerServiceError(
        error.response?.data?.message || 'Failed to update partner',
        { originalError: error }
      );
    }
  }
};

// Delete partner (admin only)
export const deletePartner = async (id) => {
  try {
    const response = await api.delete(`/partners/${id}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 503) {
      throw new PartnerServiceError(
        'Database connection error, try again later',
        { originalError: error }
      );
    } else if (!error.response) {
      throw new PartnerServiceError(
        'Network error, check your connection',
        { originalError: error }
      );
    } else if (error.response?.status === 401) {
      throw new PartnerServiceError(
        'Authentication required',
        { originalError: error }
      );
    } else if (error.response?.status === 403) {
      throw new PartnerServiceError(
        'You do not have permission to delete partners',
        { originalError: error }
      );
    } else if (error.response?.status === 404) {
      throw new PartnerServiceError(
        'Partner not found',
        { originalError: error }
      );
    } else {
      throw new PartnerServiceError(
        error.response?.data?.message || 'Failed to delete partner',
        { originalError: error }
      );
    }
  }
}; 