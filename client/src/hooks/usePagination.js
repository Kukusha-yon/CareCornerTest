import { useState, useEffect } from 'react';

const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / limit);

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const changeLimit = (newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  const resetPagination = () => {
    setPage(initialPage);
    setLimit(initialLimit);
    setTotal(0);
  };

  // Update URL with pagination parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);
    params.set('limit', limit);
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${params.toString()}`
    );
  }, [page, limit]);

  // Initialize pagination from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPage = parseInt(params.get('page'));
    const urlLimit = parseInt(params.get('limit'));

    if (urlPage && !isNaN(urlPage)) {
      setPage(urlPage);
    }
    if (urlLimit && !isNaN(urlLimit)) {
      setLimit(urlLimit);
    }
  }, []);

  return {
    page,
    limit,
    total,
    loading,
    totalPages,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changeLimit,
    resetPagination,
    setTotal,
    setLoading,
  };
};

export default usePagination; 