import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import usePagination from '../hooks/usePagination';
import useSearch from '../hooks/useSearch';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ui/ProductCard';
import CategoryFilter from '../components/ui/CategoryFilter';
import DatabaseStatusIndicator from '../components/ui/DatabaseStatusIndicator';

const Products = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const {
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
  } = useSearch({
    category: category || '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
  });

  const {
    page,
    limit,
    total,
    loading: paginationLoading,
    totalPages,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changeLimit,
    setTotal,
    setLoading: setPaginationLoading,
  } = usePagination(1, 12);

  const { data: allProducts, isLoading, error: queryError } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  const filteredProducts = selectedCategory === 'all'
    ? allProducts
    : allProducts?.filter(product => product.category === selectedCategory);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setPaginationLoading(true);
        setError(null);

        const params = {
          page,
          limit,
          search: searchTerm,
          sortBy,
          sortOrder,
          ...filters,
        };

        const response = await productsAPI.getAll(params);
        setProducts(response.data.products);
        setTotal(response.data.total);
      } catch (error) {
        setError('Failed to fetch products. Please try again later.');
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
        setPaginationLoading(false);
      }
    };

    fetchProducts();
  }, [page, limit, searchTerm, sortBy, sortOrder, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateSearch(formData.get('search'));
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFilter(name, type === 'checkbox' ? checked : value);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      updateSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      updateSort(field, 'asc');
    }
  };

  const handleReset = () => {
    resetSearch();
    clearSort();
    goToPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error loading products: {queryError.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts?.map(product => (
          <Link
            key={product._id || product.id}
            to={`/products/${product._id || product.id}`}
            state={{ fromCategory: true }}
            className="block"
          >
            <ProductCard key={product._id || product.id} product={product} linkDisabled={true} />
          </Link>
        ))}
      </div>
      
      <DatabaseStatusIndicator />
    </div>
  );
};

export default Products; 