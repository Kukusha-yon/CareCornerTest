import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';

const ProductGrid = ({ products, category }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero Section - Only show if category is provided and has title/description */}
      {category && category.title && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              {category.title}
            </h1>
            {category.description && (
              <p className="mt-4 text-lg text-gray-500">
                {category.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.map((product) => (
            <div
              key={product._id}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <Link to={`/products/${product._id}`} className="block">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#39b54a] transition-colors duration-200">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                  {product.specs && (
                    <div className="mt-2 text-sm text-gray-600">
                      {Object.entries(product.specs).slice(0, 2).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-500">{key}:</span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-medium">
                      {formatCurrency(product.price)}
                    </span>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm text-gray-600">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    user
                      ? 'bg-[#39b54a] hover:bg-[#2d8f3a]'
                      : 'bg-gray-400 cursor-not-allowed'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#39b54a]`}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {user ? 'Add to Cart' : 'Sign in to Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid; 