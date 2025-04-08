import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ClipboardDocumentListIcon,
  StarIcon,
  UsersIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Partners', href: '/admin/partners', icon: BuildingOfficeIcon },
  { name: 'Featured Products', href: '/admin/featured-products', icon: StarIcon },
  { name: 'New Arrivals', href: '/admin/new-arrivals', icon: SparklesIcon },
  { name: 'Orders', href: '/admin/orders', icon: ClipboardDocumentListIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

const userNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Profile', href: '/profile', icon: UserCircleIcon },
  { name: 'Orders', href: '/order-history', icon: ClipboardDocumentListIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Determine which navigation to show based on user role
  const navigation = user?.role === 'admin' ? adminNavigation : userNavigation;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo and Toggle */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100">
            <Link 
              to="/" 
              className={`text-xl font-bold text-[#39b54a] hover:text-[#2d8f3a] transition-colors duration-200 ${
                !isSidebarExpanded && 'hidden'
              }`}
            >
              CareCorner
            </Link>
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              {isSidebarExpanded ? (
                <ChevronLeftIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#39b54a]/10 text-[#39b54a] shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 flex-shrink-0 transition-colors ${
                      isActive
                        ? 'text-[#39b54a]'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <span className={`ml-3 transition-opacity duration-200 ${
                    !isSidebarExpanded ? 'opacity-0 w-0' : 'opacity-100'
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile and Logout */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center mb-4 px-2">
              <div className="h-8 w-8 rounded-full bg-[#39b54a]/10 flex items-center justify-center">
                <UserCircleIcon className="h-5 w-5 text-[#39b54a]" />
              </div>
              <div className={`ml-3 transition-opacity duration-200 ${
                !isSidebarExpanded ? 'opacity-0 w-0' : 'opacity-100'
              }`}>
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
              <span className={`ml-3 transition-opacity duration-200 ${
                !isSidebarExpanded ? 'opacity-0 w-0' : 'opacity-100'
              }`}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'pl-64' : 'pl-20'}`}>
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <h1 className="text-xl font-semibold text-gray-900">
              {navigation.find(item => item.href === location.pathname)?.name || 'Admin Panel'}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </header>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 