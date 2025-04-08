import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import { Package, Truck, CheckCircle, Clock, HelpCircle, RefreshCw, Trash2, X, Search, Filter, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserOrders, deleteOrder } from '../services/orderService';
import { useQuery } from '@tanstack/react-query';

const OrderHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [showNewOrderToast, setShowNewOrderToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Use React Query for better data fetching and caching
  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['userOrders'],
    queryFn: getUserOrders,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true
  });

  // Show a toast if coming from order confirmation page
  useEffect(() => {
    if (location.state?.from === 'order-confirmation') {
      toast.success('Your order has been placed successfully!');
      setShowNewOrderToast(true);
    }
  }, [location]);

  const handleClearOrder = async (orderId) => {
    try {
      await deleteOrder(orderId);
      toast.success('Order cleared successfully');
      setOrderToDelete(null);
      refetch(); // Refresh the orders list
    } catch (error) {
      console.error('Error clearing order:', error);
      toast.error('Failed to clear order');
    }
  };

  const handleClearAllOrders = async () => {
    try {
      await Promise.all(orders.map(order => deleteOrder(order._id)));
      toast.success('All orders cleared successfully');
      setShowClearAllConfirm(false);
      refetch(); // Refresh the orders list
    } catch (error) {
      console.error('Error clearing all orders:', error);
      toast.error('Failed to clear all orders');
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-700 bg-green-50';
      case 'shipped':
        return 'text-blue-700 bg-blue-50';
      case 'pending':
        return 'text-yellow-700 bg-yellow-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const handleReorder = (order) => {
    try {
      // Add each item from the order to the cart
      order.items.forEach(item => {
        addToCart({
          _id: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          countInStock: item.countInStock
        }, item.quantity);
      });
      
      toast.success('Items added to cart');
      navigate('/cart');
    } catch (error) {
      console.error('Error adding items to cart:', error);
      toast.error('Failed to add items to cart');
    }
  };

  const handleContactSupport = (order) => {
    // Implement contact support functionality
    navigate('/support', { state: { orderId: order._id } });
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#39b54a]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <HelpCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">Unable to load orders</h2>
            <p className="text-gray-500 mb-4">{error.message}</p>
            <Button
              variant="primary"
              onClick={refetch}
              className="bg-[#39b54a] hover:bg-[#2d8f3a] text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-4">
              When you place an order, it will appear here.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/products')}
              className="bg-[#39b54a] hover:bg-[#2d8f3a] text-white"
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39b54a] focus:border-transparent"
              />
            </div>
            
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#39b54a] focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowClearAllConfirm(true)}
              className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              {/* Order Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-0.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">#{order._id.slice(-8)}</span>
                      <span className="text-gray-500 ml-2">${order.totalAmount.toFixed(2)}</span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setOrderToDelete(order)}
                      className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4">
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm font-medium text-gray-900 ml-2">
                            ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleReorder(order)}
                    className="flex-1 sm:flex-none text-sm py-1"
                  >
                    Reorder
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleContactSupport(order)}
                    className="flex-1 sm:flex-none text-sm py-1"
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clear All Orders Confirmation Modal */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Clear All Orders</h2>
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-500 mb-6">
              Are you sure you want to clear all your orders? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowClearAllConfirm(false)}
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleClearAllOrders}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Order Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Delete Order</h2>
              <button
                onClick={() => setOrderToDelete(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this order? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setOrderToDelete(null)}
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleClearOrder(orderToDelete._id)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory; 