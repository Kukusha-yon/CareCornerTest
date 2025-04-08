import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Button from '../components/ui/Button';
import { getProducts, PRODUCT_CATEGORIES } from '../services/productService';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  });

  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    total: 0,
  });

  useEffect(() => {
    console.log('Initial filters:', filters);
    fetchProducts();
  }, [filters, pagination.page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products with filters:', filters);
      const category = filters.category || null;
      console.log('Category being passed:', category);
      const data = await getProducts(category);
      console.log('Received products data:', data);
      setProducts(data);
      setPagination(prev => ({ ...prev, total: data.length }));
      console.log('Updated products state and pagination');
    } catch (error) {
      console.error('Error in fetchProducts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log('Filter change:', { name, value });
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
    updateSearchParams({ ...filters, [name]: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    updateSearchParams({ ...filters, page: newPage });
  };

  const updateSearchParams = (params) => {
    const newSearchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) newSearchParams.set(key, value);
    });
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39b54a]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="border rounded-md px-3 py-2"
          >
            <option value="">All Categories</option>
            <option value={PRODUCT_CATEGORIES.MONITORS}>{PRODUCT_CATEGORIES.MONITORS}</option>
            <option value={PRODUCT_CATEGORIES.SERVER}>{PRODUCT_CATEGORIES.SERVER}</option>
            <option value={PRODUCT_CATEGORIES.CISCO_SWITCH}>{PRODUCT_CATEGORIES.CISCO_SWITCH}</option>
            <option value={PRODUCT_CATEGORIES.BAGS}>{PRODUCT_CATEGORIES.BAGS}</option>
            <option value={PRODUCT_CATEGORIES.CHARGER}>{PRODUCT_CATEGORIES.CHARGER}</option>
          </select>

          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className="border rounded-md px-3 py-2"
          >
            <option value="newest">Newest</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
          </select>

          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            placeholder="Min Price"
            className="border rounded-md px-3 py-2 w-24"
          />

          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            placeholder="Max Price"
            className="border rounded-md px-3 py-2 w-24"
          />

          <Button onClick={clearFilters} variant="outline">
            Clear Filters
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8 gap-2">
          <Button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="px-4 py-2">
            Page {pagination.page} of{' '}
            {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <Button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={
              pagination.page ===
              Math.ceil(pagination.total / pagination.limit)
            }
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductList; 