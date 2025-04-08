import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDashboardData, getStats, getOrderStats, getProductStats, getCustomerStats } from '../../services/adminService';
import { getAppSetting, updateAppSetting } from '../../services/settingService';
import { Switch } from '@headlessui/react';
import toast from 'react-hot-toast';
import { 
  ChartBarIcon, 
  ShoppingCartIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState('week');

  const { data: dashboardData, isLoading: isLoadingDashboard, error: dashboardError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: statsData, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ['stats', timeRange],
    queryFn: () => getStats(timeRange),
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: orderStats, isLoading: isLoadingOrderStats, error: orderStatsError } = useQuery({
    queryKey: ['orderStats', timeRange],
    queryFn: () => getOrderStats(timeRange),
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: productStats, isLoading: isLoadingProductStats, error: productStatsError } = useQuery({
    queryKey: ['productStats', timeRange],
    queryFn: () => getProductStats(timeRange),
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: customerStats, isLoading: isLoadingCustomerStats, error: customerStatsError } = useQuery({
    queryKey: ['customerStats', timeRange],
    queryFn: () => getCustomerStats(timeRange),
    retry: 2,
    refetchOnWindowFocus: false
  });

  const { data: acceptOrdersSetting } = useQuery({
    queryKey: ['setting', 'acceptOrders'],
    queryFn: () => getAppSetting('acceptOrders')
  });

  const { data: contactInfoSetting } = useQuery({
    queryKey: ['setting', 'contactInfo'],
    queryFn: () => getAppSetting('contactInfo')
  });

  const updateOrderAcceptanceMutation = useMutation({
    mutationFn: (value) => updateAppSetting('acceptOrders', value),
    onSuccess: () => {
      queryClient.invalidateQueries(['setting', 'acceptOrders']);
      toast.success('Order acceptance setting updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order acceptance setting');
    }
  });

  const handleOrderAcceptanceToggle = (enabled) => {
    updateOrderAcceptanceMutation.mutate(enabled);
  };

  if (isLoadingDashboard || isLoadingStats || isLoadingOrderStats || isLoadingProductStats || isLoadingCustomerStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#39b54a]"></div>
      </div>
    );
  }

  // Calculate growth percentages
  const calculateGrowth = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const stats = [
    {
      name: 'Total Revenue',
      value: `$${dashboardData?.totalRevenue?.toFixed(2) || '0.00'}`,
      change: `${calculateGrowth(dashboardData?.totalRevenue, orderStats?.totalRevenue) > 0 ? '+' : ''}${calculateGrowth(dashboardData?.totalRevenue, orderStats?.totalRevenue).toFixed(2)}%`,
      changeType: calculateGrowth(dashboardData?.totalRevenue, orderStats?.totalRevenue) >= 0 ? 'increase' : 'decrease',
      icon: CurrencyDollarIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Orders',
      value: dashboardData?.totalOrders || 0,
      change: `${calculateGrowth(dashboardData?.totalOrders, orderStats?.totalOrders) > 0 ? '+' : ''}${calculateGrowth(dashboardData?.totalOrders, orderStats?.totalOrders).toFixed(2)}%`,
      changeType: calculateGrowth(dashboardData?.totalOrders, orderStats?.totalOrders) >= 0 ? 'increase' : 'decrease',
      icon: ShoppingCartIcon,
      color: 'bg-[#39b54a]'
    },
    {
      name: 'Total Customers',
      value: dashboardData?.totalCustomers || 0,
      change: `${calculateGrowth(dashboardData?.totalCustomers, customerStats?.totalCustomers) > 0 ? '+' : ''}${calculateGrowth(dashboardData?.totalCustomers, customerStats?.totalCustomers).toFixed(2)}%`,
      changeType: calculateGrowth(dashboardData?.totalCustomers, customerStats?.totalCustomers) >= 0 ? 'increase' : 'decrease',
      icon: UserGroupIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Average Order Value',
      value: `$${dashboardData?.averageOrderValue?.toFixed(2) || '0.00'}`,
      change: `${calculateGrowth(dashboardData?.averageOrderValue, productStats?.averageOrderValue) > 0 ? '+' : ''}${calculateGrowth(dashboardData?.averageOrderValue, productStats?.averageOrderValue).toFixed(2)}%`,
      changeType: calculateGrowth(dashboardData?.averageOrderValue, productStats?.averageOrderValue) >= 0 ? 'increase' : 'decrease',
      icon: ChartBarIcon,
      color: 'bg-amber-500'
    }
  ];

  // Get status counts from orderStatusDistribution
  const getStatusCount = (status) => {
    if (!dashboardData?.orderStatusDistribution) return 0;
    const statusObj = dashboardData.orderStatusDistribution.find(s => s.status === status);
    return statusObj ? statusObj.count : 0;
  };

  const pendingOrders = getStatusCount('pending');
  const processingOrders = getStatusCount('processing');
  const shippedOrders = getStatusCount('shipped');
  const deliveredOrders = getStatusCount('delivered');
  const cancelledOrders = getStatusCount('cancelled');

  // Format date for recent orders
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Acceptance Toggle */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Order Acceptance</h3>
            <p className="text-sm text-gray-500">
              Toggle whether the system accepts new orders
            </p>
          </div>
          <Switch
            checked={acceptOrdersSetting?.value ?? true}
            onChange={handleOrderAcceptanceToggle}
            className={`${
              acceptOrdersSetting?.value ? 'bg-[#39b54a]' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#39b54a] focus:ring-offset-2`}
          >
            <span
              className={`${
                acceptOrdersSetting?.value ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome to your admin dashboard</p>
        </div>
        <div className="flex items-center bg-white rounded-lg shadow-sm p-1">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              timeRange === 'week'
                ? 'bg-[#39b54a] text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              timeRange === 'month'
                ? 'bg-[#39b54a] text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              timeRange === 'year'
                ? 'bg-[#39b54a] text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm transition-all hover:shadow-md sm:px-6 sm:py-6"
          >
            <dt>
              <div className={`absolute rounded-lg ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'increase'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stat.changeType === 'increase' ? (
                  <ArrowUpIcon
                    className="h-5 w-5 flex-shrink-0 self-center text-green-500"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowDownIcon
                    className="h-5 w-5 flex-shrink-0 self-center text-red-500"
                    aria-hidden="true"
                  />
                )}
                <span className="sr-only">
                  {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                </span>
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-3">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <ClockIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <p className="text-xl font-semibold text-gray-900">{pendingOrders}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Processing</p>
            <p className="text-xl font-semibold text-gray-900">{processingOrders}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <ShoppingCartIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Shipped</p>
            <p className="text-xl font-semibold text-gray-900">{shippedOrders}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Delivered</p>
            <p className="text-xl font-semibold text-gray-900">{deliveredOrders}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <XCircleIcon className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cancelled</p>
            <p className="text-xl font-semibold text-gray-900">{cancelledOrders}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <ShoppingCartIcon className="h-5 w-5 mr-2 text-[#39b54a]" />
              Recent Orders
            </h2>
          </div>
          <div className="flow-root">
            <ul role="list" className="divide-y divide-gray-100">
              {dashboardData?.recentOrders?.length > 0 ? (
                dashboardData.recentOrders.map((order) => (
                  <li key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {order.customer}
                        </p>
                        <div className="flex items-center mt-1">
                          <p className="text-xs text-gray-500">
                            Order #{order.id.substring(0, 8)} • {formatDate(order.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-900">
                          ${order.amount.toFixed(2)}
                        </span>
                        <span
                          className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'shipped'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-4 text-center text-gray-500">No recent orders</li>
              )}
            </ul>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
            <a href="/admin/orders" className="text-sm font-medium text-[#39b54a] hover:text-[#2d9240]">
              View all orders
            </a>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-[#39b54a]" />
              Sales by Category
            </h2>
          </div>
          <div className="flow-root">
            <ul role="list" className="divide-y divide-gray-100">
              {statsData?.salesByCategory?.length > 0 ? (
                statsData.salesByCategory.map((category) => (
                  <li key={category.category} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {category.category}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          ${category.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-4 text-center text-gray-500">No category data available</li>
              )}
            </ul>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
            <a href="/admin/products" className="text-sm font-medium text-[#39b54a] hover:text-[#2d9240]">
              View all products
            </a>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-[#39b54a]" />
            Top Products
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {statsData?.topProducts?.length > 0 ? (
                statsData.topProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.stock || 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No product data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 