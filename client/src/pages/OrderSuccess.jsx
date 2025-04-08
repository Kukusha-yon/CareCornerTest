import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Button from '../components/ui/Button';
import { CheckCircle, Phone, Mail, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUserOrders } from '../services/orderService';

const OrderSuccess = () => {
  const navigate = useNavigate();
  
  // Fetch the latest orders to ensure the new order is visible
  const { data: orders, isLoading } = useQuery({
    queryKey: ['userOrders'],
    queryFn: getUserOrders,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true
  });

  // Auto-redirect to order history after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/order-history');
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-2xl w-full mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-[#39b54a]" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank you for your order!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            We've received your order and will process it shortly.
          </p>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Next Steps
            </h2>
            <p className="text-gray-600 mb-6">
              Our team will contact you within 24 hours to discuss your order details and arrange delivery.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Phone className="w-5 h-5" />
                <span>+251 911 123 456</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>orders@carecorner.com</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <MessageCircle className="w-5 h-5" />
                <span>Telegram: @carecorner</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              className="bg-[#39b54a] hover:bg-[#2d8f3a] text-white"
              onClick={() => navigate('/order-history')}
            >
              View Order Status
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              fullWidth
              className="border-[#39b54a] text-[#39b54a] hover:bg-[#39b54a] hover:text-white"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            You will be automatically redirected to your order history in 10 seconds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess; 