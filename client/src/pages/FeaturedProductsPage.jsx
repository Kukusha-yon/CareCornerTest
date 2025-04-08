import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getFeaturedProducts } from '../services/productService';
import { ArrowLeft } from 'lucide-react';

const FeaturedProductsPage = () => {
  const { data: featuredProducts, isLoading, error } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: getFeaturedProducts
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error loading featured products. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Featured Products</h1>

      {!featuredProducts?.length ? (
        <div className="text-center text-gray-600">
          No featured products available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <Link
              key={product._id}
              to={product.link}
              className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative aspect-w-16 aspect-h-9">
                <img
                  src={product.image}
                  alt={product.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                {product.highlightText && (
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    {product.highlightText}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {product.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                {product.buttonText && (
                  <span className="inline-flex items-center text-blue-600 hover:text-blue-700">
                    {product.buttonText}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedProductsPage; 