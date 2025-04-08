import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from './Button';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import formatCurrency from '../../utils/formatCurrency';

const ProductCard = memo(({ product, linkDisabled = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();

  // Check if product is valid
  if (!product || !product._id) {
    console.error('Invalid product data:', product);
    return null;
  }

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.countInStock === 0) {
      toast.error('This product is out of stock');
      return;
    }
    
    addToCart(product);
    toast.success('Added to cart');
  };

  const handleImageError = (e) => {
    console.error('Error loading image:', product.image);
    setImageError(true);
    e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
  };

  const Content = () => (
    <>
      {/* Product Image */}
      <div className="relative w-full pt-[100%] bg-gray-50">
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name || 'Product image'}
              className="w-full h-full object-contain transform transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>
        {product.isBestSeller && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
            Best Seller
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-[#39b54a] transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mb-2">
          <div className="mt-2">
            <span className="text-lg font-medium text-gray-900">
              {formatCurrency(product.price)}
            </span>
          </div>
          {product.countInStock > 0 ? (
            <span className="text-sm text-green-600">In Stock</span>
          ) : (
            <span className="text-sm text-red-600">Out of Stock</span>
          )}
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={product.countInStock === 0}
          className="w-full"
          variant={product.countInStock === 0 ? 'disabled' : 'primary'}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </>
  );

  return (
    <div 
      className="group relative bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {linkDisabled ? (
        <Content />
      ) : (
        <Link to={`/products/${product._id}`} state={{ fromCategory: true }} className="block">
          <Content />
        </Link>
      )}
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard; 