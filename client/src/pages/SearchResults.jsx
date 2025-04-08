import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '../services/productService';
import { Star } from 'lucide-react';
import SmoothLink from '../components/ui/SmoothLink';
import formatCurrency from '../utils/formatCurrency';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  console.log('SearchResults - Query from URL:', query);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return [];
      console.log('SearchResults - Executing search for query:', query);
      try {
        const results = await searchProducts(query);
        console.log('SearchResults - Search results:', results);
        if (!Array.isArray(results)) {
          console.error('SearchResults - Invalid response format:', results);
          return [];
        }
        return results;
      } catch (error) {
        console.error('SearchResults - Search error:', error);
        throw error;
      }
    },
    enabled: !!query,
    retry: 1
  });

  console.log('SearchResults - Current state:', {
    isLoading,
    error,
    productsCount: products?.length,
    query,
    products: products?.slice(0, 2) // Log first two products for debugging
  });

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#39b54a]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Failed to fetch search results</h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Search Results Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <p className="text-sm text-gray-600">
            {products?.length || 0} results for <span className="font-bold">"{query}"</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Main Content - Product List */}
        <div className="space-y-4">
          {products?.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No results found</h3>
              <p className="mt-2 text-gray-500">
                Try adjusting your search terms or browse our categories
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {products?.map((product) => (
                <SmoothLink
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="block"
                >
                  <div className="flex gap-6 p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-200">
                    {/* Product Image */}
                    <div className="w-48 h-48 flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h2 className="text-lg font-medium text-[#39b54a] hover:text-[#2d8f3a]">
                        {product.name}
                      </h2>

                      {/* Rating */}
                      <div className="flex items-center mt-2">
                        <div className="flex">
                          {renderStars(product.rating || 0)}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          ({product.reviews?.length || 0})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mt-2">
                        <span className="text-2xl font-medium">
                          {formatCurrency(product.price)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Specs Preview */}
                      {product.specs && (
                        <div className="mt-2">
                          <ul className="text-sm text-gray-600 space-y-1">
                            {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
                              <li key={key}>• {key}: {value}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </SmoothLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults; 