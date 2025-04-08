import api from './api';

class FeaturedProductServiceError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
    super(message);
    this.name = 'FeaturedProductServiceError';
    this.code = code;
    this.details = details;
  }
}

const API_URL = '/featured-products';

export const getFeaturedProducts = async () => {
  try {
    const response = await api.get('/featured-products');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new FeaturedProductServiceError(
        error.response.data.message || 'Failed to fetch featured products',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new FeaturedProductServiceError(
      'Network error while fetching featured products',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const getFeaturedProduct = async (id) => {
  try {
    const response = await api.get(`/featured-products/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new FeaturedProductServiceError(
        error.response.data.message || 'Failed to fetch featured product',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new FeaturedProductServiceError(
      'Network error while fetching featured product',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const getFeaturedProductByProductId = async (productId, suppressLogging = true) => {
  try {
    const response = await api.get(`/featured-products/product/${productId}`, {
      // Add a flag to suppress error logging in the axios interceptor
      // This will prevent axios from logging the error to the console
      showErrorToast: false,
      errorHandling: {
        suppressLogging
      }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Detailed error with response status code
      const status = error.response.status;
      const message = error.response.data?.message || 'Failed to fetch featured product by product ID';
      
      // If it's a 404, this is expected for products without featured versions
      // Return null instead of throwing for 404s
      if (status === 404) {
        return null;
      }
      
      throw new FeaturedProductServiceError(
        message,
        'FETCH_ERROR',
        { 
          status, 
          data: error.response.data,
          productId
        }
      );
    }
    
    // Network or other errors
    throw new FeaturedProductServiceError(
      'Network error while fetching featured product by product ID',
      'NETWORK_ERROR',
      { 
        originalError: error.message,
        productId
      }
    );
  }
};

export const createFeaturedProduct = async (featuredProductData) => {
  try {
    const formData = new FormData();
    formData.append('productId', featuredProductData.productId);
    formData.append('title', featuredProductData.title);
    formData.append('description', featuredProductData.description);
    formData.append('image', featuredProductData.image);
    formData.append('order', featuredProductData.order);

    const response = await api.post('/featured-products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new FeaturedProductServiceError(
        error.response.data.message || 'Failed to create featured product',
        'CREATE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new FeaturedProductServiceError(
      'Network error while creating featured product',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const updateFeaturedProduct = async (id, featuredProductData) => {
  try {
    const formData = new FormData();
    formData.append('productId', featuredProductData.productId);
    formData.append('title', featuredProductData.title);
    formData.append('description', featuredProductData.description);
    if (featuredProductData.image) {
      formData.append('image', featuredProductData.image);
    }
    formData.append('order', featuredProductData.order);

    const response = await api.put(`/featured-products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new FeaturedProductServiceError(
        error.response.data.message || 'Failed to update featured product',
        'UPDATE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new FeaturedProductServiceError(
      'Network error while updating featured product',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const deleteFeaturedProduct = async (id) => {
  try {
    const response = await api.delete(`/featured-products/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new FeaturedProductServiceError(
        error.response.data.message || 'Failed to delete featured product',
        'DELETE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new FeaturedProductServiceError(
      'Network error while deleting featured product',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const updateFeaturedProductOrder = async (id, order) => {
  try {
    const response = await api.put(`/featured-products/${id}/order`, { order });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new FeaturedProductServiceError(
        error.response.data.message || 'Failed to update featured product order',
        'UPDATE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new FeaturedProductServiceError(
      'Network error while updating featured product order',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
}; 