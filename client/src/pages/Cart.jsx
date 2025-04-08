import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import formatCurrency from '../utils/formatCurrency';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);

  useEffect(() => {
    // Calculate estimated delivery date (3-5 business days from now)
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 5); // 5 days from now
    setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }));
  }, []);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please sign in to proceed to checkout');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    setLoading(true);
    try {
      navigate('/checkout');
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ensure cartItems is an array before checking length
  const items = Array.isArray(cartItems) ? cartItems : [];

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/products')}
              className="bg-[#FFD814] hover:bg-[#F7CA00] text-black"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = items.reduce(
    (total, item) => total + (item.price || 0) * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Cart items */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {items.map((item, index) => (
                <div
                  key={item._id}
                  className={`flex items-center p-6 ${
                    index !== items.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title || item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="ml-6 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.title || item.name}
                    </h3>
                    {item.price && (
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {formatCurrency(item.price)}
                      </p>
                    )}
                    <div className="mt-4 flex items-center">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="p-2 text-gray-600 hover:text-gray-900"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="p-2 text-gray-600 hover:text-gray-900"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="ml-4 text-red-600 hover:text-red-700 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    <p className="text-lg font-medium text-gray-900">
                      {formatCurrency((item.price || 0) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping & handling</span>
                  <span className="text-gray-900">{formatCurrency(shipping)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {estimatedDelivery && (
                <div className="mt-4 text-sm text-gray-500">
                  Estimated delivery: {estimatedDelivery}
                </div>
              )}

              <div className="mt-6 space-y-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-[#39b54a] hover:bg-[#39b54a] text-black font-medium"
                  onClick={handleCheckout}
                  loading={loading}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>

              {!user && (
                <p className="mt-4 text-sm text-gray-500 text-center">
                  You'll need to sign in to complete your purchase
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 