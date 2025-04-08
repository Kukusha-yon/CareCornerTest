import api from './api';

// Product categories
export const PRODUCT_CATEGORIES = {
  CISCO_SWITCH: 'CISCO Switch',
  SERVER: 'Server',
  MONITORS: 'Monitors',
  LOGITECH_WORLD: 'Logitech World',
  BAGS: 'Bags',
  CHARGER: 'Charger'
};

class ProductServiceError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = {}) {
    super(message);
    this.name = 'ProductServiceError';
    this.code = code;
    this.details = details;
  }
}

export const getProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new ProductServiceError(
        error.response.data.message || 'Failed to fetch products',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new ProductServiceError(
      'Network error while fetching products',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const getProduct = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new ProductServiceError(
        error.response.data.message || 'Failed to fetch product',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new ProductServiceError(
      'Network error while fetching product',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new ProductServiceError(
        error.response.data.message || 'Failed to create product',
        'CREATE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new ProductServiceError(
      'Network error while creating product',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new ProductServiceError(
        error.response.data.message || 'Failed to update product',
        'UPDATE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new ProductServiceError(
      'Network error while updating product',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new ProductServiceError(
        error.response.data.message || 'Failed to delete product',
        'DELETE_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new ProductServiceError(
      'Network error while deleting product',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const getBestSellers = async () => {
  const response = await api.get('/products/best-sellers');
  return response.data;
};

export const getFeaturedProducts = async () => {
  try {
    const response = await api.get('/products/featured');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new ProductServiceError(
        error.response.data.message || 'Failed to fetch featured products',
        'FETCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new ProductServiceError(
      'Network error while fetching featured products',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const searchProducts = async (query) => {
  try {
    const response = await api.get('/products/search', { params: { q: query } });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new ProductServiceError(
        error.response.data.message || 'Failed to search products',
        'SEARCH_ERROR',
        { status: error.response.status, data: error.response.data }
      );
    }
    throw new ProductServiceError(
      'Network error while searching products',
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }
};

export const getProductsByCategory = async (category) => {
  const response = await api.get(`/products/category/${encodeURIComponent(category)}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
}; 