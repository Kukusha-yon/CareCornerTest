import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaTelegram } from 'react-icons/fa';
import { Phone, Mail, MessageCircle, Send, X, Minimize2, Maximize2, ArrowLeft } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';

const Support = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'bot',
      content: 'Hello! How can I help you today?',
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        content: 'Thank you for your message. Our team will get back to you shortly.',
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleBackToOrders = () => {
    navigate('/orders');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={handleBackToOrders}
              className="flex items-center text-[#39b54a] hover:text-[#2d8f3a] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back to Orders</span>
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Customer Support</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're here to help! Choose your preferred way to reach us below.
            </p>
          </div>

          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Phone Support */}
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <Phone className="w-6 h-6 text-[#39b54a]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-4">Available Monday to Friday, 9:00 AM - 6:00 PM</p>
              <a href="tel:+251911123456" className="text-[#39b54a] hover:text-[#2d8f3a] font-medium">
                +251 911 123 456
              </a>
            </div>

            {/* Email Support */}
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <Mail className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">We'll respond within 24 hours</p>
              <a href="mailto:support@carecorner.com" className="text-[#39b54a] hover:text-[#2d8f3a] font-medium">
                support@carecorner.com
              </a>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                <MessageCircle className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Media</h3>
              <p className="text-gray-600 mb-4">Connect with us on social media</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#39b54a]">
                  <FaFacebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#39b54a]">
                  <FaTwitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#39b54a]">
                  <FaInstagram className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#39b54a]">
                  <FaLinkedin className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#39b54a]">
                  <FaTelegram className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">How do I track my order?</h3>
                <p className="text-gray-600">
                  You can track your order by visiting your order history page. Each order has a tracking number that you can use to monitor its status.
                </p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">What is your return policy?</h3>
                <p className="text-gray-600">
                  We offer a 30-day return policy for most items. Products must be unused and in their original packaging.
                </p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Do you offer international shipping?</h3>
                <p className="text-gray-600">
                  Yes, we offer international shipping to most countries. Shipping costs and delivery times vary by location.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Widget */}
        <div className={`fixed bottom-4 right-4 ${isChatOpen ? 'z-50' : ''}`}>
          {!isChatOpen ? (
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-[#39b54a] text-white rounded-full p-4 shadow-lg hover:bg-[#2d8f3a] transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          ) : (
            <div className={`bg-white rounded-lg shadow-xl w-80 sm:w-96 transition-all duration-300 ${isChatMinimized ? 'h-12' : 'h-[500px]'}`}>
              {/* Chat Header */}
              <div className="bg-[#39b54a] text-white p-4 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">Customer Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsChatMinimized(!isChatMinimized)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    {isChatMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              {!isChatMinimized && (
                <>
                  <div className="p-4 h-[380px] overflow-y-auto">
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`mb-4 ${
                          msg.type === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div
                          className={`inline-block p-3 rounded-lg ${
                            msg.type === 'user'
                              ? 'bg-[#39b54a] text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#39b54a] focus:border-transparent"
                      />
                      <button
                        type="submit"
                        className="bg-[#39b54a] text-white rounded-lg px-4 py-2 hover:bg-[#2d8f3a] transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Support; 