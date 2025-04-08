import { XMarkIcon } from '@heroicons/react/24/outline';

const OrderNotification = ({ contactInfo, onClose }) => {
  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Orders Currently Not Accepted
          </h3>
          <p className="text-gray-600 mb-4">
            We apologize, but we are currently not accepting online orders. Please contact us through one of the following channels:
          </p>
          
          <div className="space-y-3">
            <a
              href={contactInfo?.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 px-4 bg-[#0088cc] text-white rounded-md hover:bg-[#006699] transition-colors"
            >
              Contact via Telegram
            </a>
            
            <a
              href={contactInfo?.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 px-4 bg-[#1877f2] text-white rounded-md hover:bg-[#166fe5] transition-colors"
            >
              Contact via Facebook
            </a>
            
            <a
              href={`tel:${contactInfo?.phone}`}
              className="block w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Call us: {contactInfo?.phone}
            </a>
            
            <a
              href={`mailto:${contactInfo?.email}`}
              className="block w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Email us: {contactInfo?.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderNotification; 