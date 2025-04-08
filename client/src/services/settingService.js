import api from './api';

class SettingServiceError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
    super(message);
    this.name = 'SettingServiceError';
    this.code = code;
    this.details = details;
  }
}

// Get all app settings (key-value pairs)
export const getAppSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

// Get a specific app setting by key
export const getAppSetting = async (key) => {
  const response = await api.get(`/settings/${key}`);
  return response.data;
};

// Update a specific app setting
export const updateAppSetting = async (key, value) => {
  const response = await api.put(`/settings/${key}`, { value });
  return response.data;
};

// Get site settings (singleton)
export const getSiteSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

// Update site settings
export const updateSiteSettings = async (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null) {
      formData.append(key, data[key]);
    }
  });
  
  const response = await api.put('/admin/settings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new SettingServiceError(
        error.response.data.message || 'Failed to fetch settings',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new SettingServiceError(
      'Network error while fetching settings',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const updateSettings = async (settingsData) => {
  try {
    const response = await api.put('/settings', settingsData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new SettingServiceError(
        error.response.data.message || 'Failed to update settings',
        'UPDATE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new SettingServiceError(
      'Network error while updating settings',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
}; 