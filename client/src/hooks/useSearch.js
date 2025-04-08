import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';

const useSearch = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // Debounced search term update
  const debouncedSetSearchTerm = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  // Update URL with search parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Update search term
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }

    // Update filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Update sorting
    if (sortBy) {
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
    } else {
      params.delete('sortBy');
      params.delete('sortOrder');
    }

    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${params.toString()}`
    );
  }, [filters, searchTerm, sortBy, sortOrder]);

  // Initialize search parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Set search term
    const urlSearch = params.get('search');
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }

    // Set filters
    const urlFilters = {};
    params.forEach((value, key) => {
      if (key !== 'search' && key !== 'sortBy' && key !== 'sortOrder') {
        urlFilters[key] = value;
      }
    });
    setFilters((prev) => ({ ...prev, ...urlFilters }));

    // Set sorting
    const urlSortBy = params.get('sortBy');
    const urlSortOrder = params.get('sortOrder');
    if (urlSortBy) {
      setSortBy(urlSortBy);
    }
    if (urlSortOrder) {
      setSortOrder(urlSortOrder);
    }
  }, []);

  const updateSearch = (value) => {
    debouncedSetSearchTerm(value);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const clearSort = () => {
    setSortBy('');
    setSortOrder('asc');
  };

  const resetSearch = () => {
    setSearchTerm('');
    clearFilters();
    clearSort();
  };

  return {
    filters,
    searchTerm,
    sortBy,
    sortOrder,
    updateFilter,
    updateSearch,
    updateSort,
    clearFilters,
    clearSort,
    resetSearch,
  };
};

export default useSearch; 