import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { getPartners } from '../../services/partnerService';

const Footer = () => {
  const { data: partners, isLoading, error } = useQuery({
    queryKey: ['partners'],
    queryFn: getPartners,
  });

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo Section */}
        <div className="flex justify-center mb-12">
          <Link to="/" className="flex-shrink-0">
            <img
              className="h-24 w-auto"
              src="/logo.png"
              alt="CareCorner"
            />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">CareCorner</h3>
            <p className="text-gray-400">
              Your trusted partner in TechWorld solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-400 hover:text-white">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/cisco-switch" className="text-gray-400 hover:text-white">
                  CISCO Switch
                </Link>
              </li>
              <li>
                <Link to="/server" className="text-gray-400 hover:text-white">
                  Server
                </Link>
              </li>
              <li>
                <Link to="/monitors" className="text-gray-400 hover:text-white">
                  Monitors
                </Link>
              </li>
              <li>
                <Link to="/logitech" className="text-gray-400 hover:text-white">
                  Logitech World
                </Link>
              </li>
              <li>
                <Link to="/bags" className="text-gray-400 hover:text-white">
                  Bags
                </Link>
              </li>
              <li>
                <Link to="/charger" className="text-gray-400 hover:text-white">
                  Chargers
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Cameroon St, ground floor</li>
              <li>Helzer Tower, Addis Ababa, Ethiopia</li>
              <li>Phone: +251-911-880-783</li>
              <li>Email: info@carecorner.com</li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/p/Care-corner-importer-100054677623430/" className="text-gray-400 hover:text-white">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Partners Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="text-lg font-semibold mb-6 text-center">Our Partners</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {isLoading ? (
              <div className="col-span-4 text-center">Loading partners...</div>
            ) : error ? (
              <div className="col-span-4 text-center text-red-500">
                Error loading partners
              </div>
            ) : (
              partners?.map((partner) => (
                <a
                  key={partner._id}
                  href={partner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-4 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-12 w-auto"
                  />
                </a>
              ))
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} CareCorner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 