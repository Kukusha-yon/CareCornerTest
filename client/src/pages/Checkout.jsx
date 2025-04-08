import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { CreditCard, Truck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { createOrder } from '../services/orderService';
import { useQuery } from '@tanstack/react-query';
import { getAppSetting } from '../services/settingService';
import OrderNotification from '../components/ui/OrderNotification';
import { formatCurrency } from '../utils/formatCurrency';
import { ensureStringId } from '../utils/formatHelpers';
import { checkToken, forceRefreshToken } from '../utils/tokenHelper';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, validateCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    additionalInfo: ''
  });
  const [showOrderNotification, setShowOrderNotification] = useState(false);
  
  const { data: acceptOrdersSetting } = useQuery({
    queryKey: ['setting', 'acceptOrders'],
    queryFn: () => getAppSetting('acceptOrders')
  });

  const { data: contactInfoSetting } = useQuery({
    queryKey: ['setting', 'contactInfo'],
    queryFn: () => getAppSetting('contactInfo')
  });

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, cartItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (acceptOrdersSetting && acceptOrdersSetting.value === false) {
      setShowOrderNotification(true);
      return false;
    }

    if (!user || !user._id) {
      toast.error('Please log in to complete your order');
      navigate('/login', { state: { from: '/checkout' } });
      return false;
    }

    if (!selectedPayment) {
      toast.error('Please select a payment method');
      return false;
    }

    if (!formData.fullName || !formData.email || !formData.phone || 
        !formData.address || !formData.city || !formData.state) {
      toast.error('Please fill in all required fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (formData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare items with any special product IDs needed for lookup
      const orderItems = cartItems.map(item => {
        // For featured products, make sure we include productId for the actual product
        if (item.isFeatured || item.type === 'featured') {
          // Check for actualProductId field (set during cart addition)
          if (item.actualProductId) {
            return {
              product: item._id, // The featured product ID
              productId: item.actualProductId, // The actual product this is featuring
              productType: 'featuredProduct',
              quantity: item.quantity,
              price: item.price,
              name: item.name || item.title
            };
          }
        }
        
        // For new arrivals
        if (item.isNewArrival || item.type === 'newArrival') {
          return {
            product: item._id,
            productType: 'newArrival',
            quantity: item.quantity,
            price: item.price,
            name: item.name || item.title
          };
        }
        
        // Regular product
        return {
          product: item._id,
          productType: 'product',
          quantity: item.quantity,
          price: item.price,
          name: item.name || item.title
        };
      });
      
      const orderData = {
        items: orderItems,
        shippingDetails: {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phone,
          address: formData.address
        },
        paymentMethod: selectedPayment,
        totalAmount: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
      };

      await createOrder(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      
      // Add a delay before navigation to ensure toast is visible
      setTimeout(() => {
        navigate('/order-success', { state: { from: 'checkout' } });
      }, 1000);
    } catch (error) {
      // Check if error contains information about a specific product
      if (error.details?.data?.message && error.details.data.message.includes('not found')) {
        toast.error('One or more products in your cart are no longer available. Please update your cart.');
        navigate('/cart');
      } else if (error.message && error.message.includes('Authentication required')) {
        toast.error('Please log in to complete your order');
        navigate('/login', { state: { from: '/checkout' } });
      } else if (error.code === 'NOT_FOUND_ERROR') {
        toast.error('Order service unavailable. Please try again later or contact support.');
      } else {
        toast.error(error.message || 'Failed to place order');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Left Column */}
          <div className="lg:col-span-7">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Shipping Address
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name <span className="text-green-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#39b54a] focus:ring-[#39b54a]"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email <span className="text-green-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#39b54a] focus:ring-[#39b54a]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-green-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#39b54a] focus:ring-[#39b54a]"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Street Address <span className="text-green-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#39b54a] focus:ring-[#39b54a]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#39b54a] focus:ring-[#39b54a]"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State/Region <span className="text-green-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#39b54a] focus:ring-[#39b54a]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#39b54a] focus:ring-[#39b54a]"
                  />
                </div>

                {/* Payment Methods */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Payment Method <span className="text-green-500">*</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 border rounded-lg cursor-pointer hover:border-[#39b54a]"
                         onClick={() => setSelectedPayment('telebirr')}>
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === 'telebirr'}
                        onChange={() => setSelectedPayment('telebirr')}
                        className="h-4 w-4 text-[#39b54a] focus:ring-[#39b54a]"
                      />
                      <img
                        src="/images/telebirr-logo.png"
                        alt="Telebirr"
                        className="h-8"
                      />
                      <span className="text-sm font-medium">Telebirr</span>
                    </div>

                    <div className="flex items-center space-x-4 p-4 border rounded-lg cursor-pointer hover:border-[#39b54a]"
                         onClick={() => setSelectedPayment('abyssinia')}>
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === 'abyssinia'}
                        onChange={() => setSelectedPayment('abyssinia')}
                        className="h-4 w-4 text-[#39b54a] focus:ring-[#39b54a]"
                      />
                      <img
                        src="/images/abyssinia-logo.png"
                        alt="Bank of Abyssinia"
                        className="h-8"
                      />
                      <span className="text-sm font-medium">Bank of Abyssinia</span>
                    </div>

                    <div className="flex items-center space-x-4 p-4 border rounded-lg cursor-pointer hover:border-[#39b54a]"
                         onClick={() => setSelectedPayment('cbe')}>
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === 'cbe'}
                        onChange={() => setSelectedPayment('cbe')}
                        className="h-4 w-4 text-[#39b54a] focus:ring-[#39b54a]"
                      />
                      <img
                        src="/images/cbe-logo.png"
                        alt="Commercial Bank of Ethiopia"
                        className="h-8"
                      />
                      <span className="text-sm font-medium">Commercial Bank of Ethiopia</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-[#39b54a] hover:bg-[#2d8f3a] text-white font-medium"
                    loading={loading}
                  >
                    Place Order
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.title || item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.title || item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency((item.price || 0) * item.quantity)}
                    </p>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
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
                      <span className="text-lg font-medium text-gray-900">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Truck className="w-4 h-4 mr-2" />
                  Free shipping on orders over $50
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Shield className="w-4 h-4 mr-2" />
                  Secure checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showOrderNotification && (
        <OrderNotification
          contactInfo={contactInfoSetting?.value}
          onClose={() => setShowOrderNotification(false)}
        />
      )}
    </div>
  );
};

export default Checkout; 