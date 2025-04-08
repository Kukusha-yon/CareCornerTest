import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import NewArrival from '../models/NewArrival.js';
import FeaturedProduct from '../models/FeaturedProduct.js';

// Get admin dashboard statistics
export const getStats = async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    
    // Calculate date range based on timeRange
    const now = new Date();
    let startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // Get orders in the selected time range
    const ordersInRange = await Order.find({
      createdAt: { $gte: startDate, $lte: now }
    });

    // Get pending orders
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Get total users
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Get new users in the selected time range
    const newUsers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startDate, $lte: now }
    });

    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get low stock products (less than 10)
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });

    // Get recent orders with user details
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // Calculate total revenue
    const totalRevenue = ordersInRange.reduce((total, order) => {
      return total + (order.totalPrice || 0);
    }, 0);

    // Calculate average order value
    const averageOrderValue = ordersInRange.length > 0 
      ? totalRevenue / ordersInRange.length 
      : 0;

    res.json({
      totalOrders,
      pendingOrders,
      totalUsers,
      newUsers,
      totalProducts,
      lowStockProducts,
      recentOrders,
      totalRevenue,
      averageOrderValue,
      timeRange
    });
  } catch (error) {
    console.error('Error in getStats:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
};

// Get dashboard data
export const getDashboard = async (req, res) => {
  try {
    // Get total revenue
    const totalRevenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
    
    // Get total orders
    const totalOrders = await Order.countDocuments({ status: { $ne: 'cancelled' } });
    
    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get total customers
    const totalCustomers = await User.countDocuments({ role: 'user' });
    
    // Get recent orders
    const recentOrders = await Order.find({ status: { $ne: 'cancelled' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .select('_id user status totalAmount createdAt');

    // Format recent orders for the frontend
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order._id,
      customer: order.user ? order.user.name : 'Unknown Customer',
      amount: order.totalAmount,
      status: order.status,
      date: new Date(order.createdAt).toLocaleDateString()
    }));

    // Get order status distribution
    const orderStatusDistribution = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalCustomers,
      recentOrders: formattedRecentOrders,
      orderStatusDistribution
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};

// Get analytics data
export const getAnalytics = async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    
    // Calculate date ranges based on timeRange
    const now = new Date();
    let startDate, previousStartDate;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        previousStartDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        previousStartDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        previousStartDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
        previousStartDate = new Date(now.setDate(now.getDate() - 7));
    }

    // Get revenue data for current period
    const revenueResult = await Order.aggregate([
      { 
        $match: { 
          status: { $ne: 'cancelled' },
          createdAt: { $gte: startDate }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    // Get revenue data for previous period
    const previousRevenueResult = await Order.aggregate([
      { 
        $match: { 
          status: { $ne: 'cancelled' },
          createdAt: { $gte: previousStartDate, $lt: startDate }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const previousRevenue = previousRevenueResult.length > 0 ? previousRevenueResult[0].total : 0;
    
    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    
    // Get revenue by category for current period
    const revenueByCategory = await Order.aggregate([
      { 
        $match: { 
          status: { $ne: 'cancelled' },
          createdAt: { $gte: startDate }
        } 
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          amount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $project: {
          category: '$_id',
          amount: 1,
          _id: 0
        }
      },
      { $sort: { amount: -1 } }
    ]);
    
    // Get order statistics for current period
    const totalOrders = await Order.countDocuments({ 
      status: { $ne: 'cancelled' },
      createdAt: { $gte: startDate }
    });
    
    // Get order statistics for previous period
    const previousOrders = await Order.countDocuments({
      status: { $ne: 'cancelled' },
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    
    const orderGrowth = previousOrders > 0 
      ? ((totalOrders - previousOrders) / previousOrders) * 100 
      : 0;
    
    // Get orders by status for current period
    const ordersByStatus = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate }
        } 
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);
    
    // Get customer statistics for current period
    const totalCustomers = await User.countDocuments({ 
      role: 'user',
      createdAt: { $gte: startDate }
    });
    
    // Get customer statistics for previous period
    const previousCustomers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });
    
    const customerGrowth = previousCustomers > 0 
      ? ((totalCustomers - previousCustomers) / previousCustomers) * 100 
      : 0;
    
    // Get customers by source
    const customers = await User.find({ role: 'user' })
      .select('createdAt')
      .sort({ createdAt: -1 });

    // Group customers by source (registration date)
    const customersBySource = [
      {
        source: 'direct',
        count: customers.filter(c => {
          const date = new Date(c.createdAt);
          return date.getHours() >= 9 && date.getHours() < 17;
        }).length
      },
      {
        source: 'referral',
        count: customers.filter(c => {
          const date = new Date(c.createdAt);
          return date.getHours() >= 17 || date.getHours() < 9;
        }).length
      }
    ];
    
    res.json({
      revenue: {
        total: totalRevenue,
        growth: parseFloat(revenueGrowth.toFixed(1)),
        byCategory: revenueByCategory
      },
      orders: {
        total: totalOrders,
        growth: parseFloat(orderGrowth.toFixed(1)),
        byStatus: ordersByStatus
      },
      customers: {
        total: totalCustomers,
        growth: parseFloat(customerGrowth.toFixed(1)),
        bySource: customersBySource
      }
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    console.log('Attempting to delete user with ID:', req.params.userId);
    
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      console.log('User not found with ID:', req.params.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Found user:', user.email);
    await user.deleteOne();
    
    console.log('User deleted successfully');
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    
    // Calculate date range based on timeRange
    const now = new Date();
    let startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Get total orders
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: now }
    });

    // Get total revenue
    const revenueResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Get orders by status
    const pendingOrders = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: now },
      status: 'pending'
    });

    const processingOrders = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: now },
      status: 'processing'
    });

    const shippedOrders = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: now },
      status: 'shipped'
    });

    const deliveredOrders = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: now },
      status: 'delivered'
    });

    const cancelledOrders = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: now },
      status: 'cancelled'
    });

    res.json({
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({ message: 'Error fetching order statistics' });
  }
};

// Get product statistics
export const getProductStats = async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    
    // Calculate date range based on timeRange
    const now = new Date();
    let startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get low stock products (less than 10)
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });

    // Get out of stock products
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });

    // Get products by category
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product._id',
          name: { $first: '$product.name' },
          category: { $first: '$product.category' },
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      productsByCategory,
      topProducts
    });
  } catch (error) {
    console.error('Error fetching product statistics:', error);
    res.status(500).json({ message: 'Error fetching product statistics' });
  }
};

// Get customer statistics
export const getCustomerStats = async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    
    // Calculate date range based on timeRange
    const now = new Date();
    let startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Get total customers
    const totalCustomers = await User.countDocuments({ role: 'user' });

    // Get new customers in the time range
    const newCustomers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startDate, $lte: now }
    });

    // Get customers by order count
    const customersByOrderCount = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          orderCount: 1,
          totalSpent: 1,
          _id: 0
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 }
    ]);

    // Get average order value per customer
    const averageOrderValue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          averageOrderValue: { $divide: ['$totalAmount', '$orderCount'] },
          _id: 0
        }
      }
    ]);

    res.json({
      totalCustomers,
      newCustomers,
      customersByOrderCount,
      averageOrderValue: averageOrderValue.length > 0 ? averageOrderValue[0].averageOrderValue : 0
    });
  } catch (error) {
    console.error('Error fetching customer statistics:', error);
    res.status(500).json({ message: 'Error fetching customer statistics' });
  }
};

// Create a new user (admin only)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      phone,
      isEmailVerified: true // Admin-created users are automatically verified
    });

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
}; 