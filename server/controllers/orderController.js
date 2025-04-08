import Order from '../models/Order.js';
import Product from '../models/Product.js';
import NewArrival from '../models/NewArrival.js';
import FeaturedProduct from '../models/FeaturedProduct.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Utility function to ensure we have a proper string ID
function ensureStringId(id) {
  if (!id) return null;
  
  // If it's already a string that's not [object Object]
  if (typeof id === 'string' && !id.includes('[object Object]')) {
    return id;
  }
  
  // If it's a MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(id)) {
    return id.toString();
  }
  
  // If it's an object with _id
  if (typeof id === 'object' && id !== null) {
    if (id._id) {
      return id._id.toString();
    }
    // Try toString() method which might return the ID
    if (typeof id.toString === 'function') {
      const str = id.toString();
      if (mongoose.Types.ObjectId.isValid(str) && str !== '[object Object]') {
        return str;
      }
    }
  }
  
  // Failed to extract a valid ID
  console.error('Failed to extract valid ID from:', id);
  return null;
}

// Create order
export const createOrder = async (req, res) => {
  try {
    console.log('Received order request:', {
      body: req.body,
      user: req.user,
      headers: Object.keys(req.headers)
    });

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.error('Authentication failed - user object:', req.user);
      return res.status(401).json({ message: 'Authentication required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract data from request
    const { items, shippingDetails, totalAmount, paymentMethod } = req.body;
    console.log('Order data:', { 
      items: Array.isArray(items) ? items.length : 'not an array', 
      shippingDetails, 
      totalAmount,
      paymentMethod 
    });

    // More flexible validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Items missing or invalid:', items);
      return res.status(400).json({ message: 'Order items are required and must be an array' });
    }

    if (!shippingDetails) {
      console.error('Shipping details missing');
      return res.status(400).json({ message: 'Shipping details are required' });
    }

    if (totalAmount === undefined || isNaN(parseFloat(totalAmount))) {
      console.error('Total amount missing or invalid:', totalAmount);
      return res.status(400).json({ message: 'Valid total amount is required' });
    }

    if (!paymentMethod) {
      console.error('Payment method missing');
      return res.status(400).json({ message: 'Payment method is required' });
    }

    // Verify stock and calculate total
    let calculatedTotal = 0;
    let processedItems = [];
    
    for (const item of items) {
      // Get product type from the item if provided
      let productType = item.productType || 'product';
      
      // Ensure we have a string ID, not an object reference
      const productId = ensureStringId(item.product);
      if (!productId) {
        return res.status(400).json({ 
          message: `Invalid product ID format: ${item.product}` 
        });
      }
      
      console.log('Processing item:', { productId, productType, productId: item.productId });
      
      let product;
      
      // Check the appropriate collection based on product type
      if (productType === 'featuredProduct') {
        // For featured products, check if we have a specific productId field
        // This means we're using a featured product that references a real product
        if (item.productId) {
          const actualProductId = ensureStringId(item.productId);
          console.log('Featured product with direct productId reference:', actualProductId);
          
          if (!actualProductId) {
            return res.status(400).json({ 
              message: `Invalid product ID format in featured product reference: ${item.productId}` 
            });
          }
          
          // Look up the actual product directly
          product = await Product.findById(actualProductId);
          console.log('Featured product related product lookup:', { 
            actualProductId, 
            result: product ? 'found' : 'not found' 
          });
          
          if (!product) {
            return res.status(404).json({ 
              message: `Referenced product ${actualProductId} for featured product not found` 
            });
          }
        } else {
          // Traditional lookup using the featured product's ID
          const featuredProduct = await FeaturedProduct.findById(productId);
          console.log('Featured product lookup:', { 
            featuredProductId: productId, 
            result: featuredProduct ? 'found' : 'not found' 
          });
          
          if (!featuredProduct) {
            return res.status(404).json({ 
              message: `Featured product ${productId} not found` 
            });
          }
          
          // Now look up the actual product using productId from the featured product
          if (featuredProduct.productId) {
            const actualProductId = ensureStringId(featuredProduct.productId);
            if (!actualProductId) {
              return res.status(400).json({ 
                message: `Invalid product ID format in featured product: ${featuredProduct.productId}` 
              });
            }
              
            product = await Product.findById(actualProductId);
            console.log('Related product lookup:', { 
              productId: actualProductId, 
              result: product ? 'found' : 'not found' 
            });
          }
        }
      } else if (productType === 'newArrival') {
        product = await NewArrival.findById(productId);
        console.log('NewArrival lookup:', {
          productId: productId,
          result: product ? 'found' : 'not found'
        });
      } else {
        // Default to regular product
        product = await Product.findById(productId);
        console.log('Regular product lookup:', {
          productId: productId,
          result: product ? 'found' : 'not found'
        });
      }
      
      if (!product) {
        return res.status(404).json({ 
          message: `Product ${productId} not found in any collection` 
        });
      }
      
      // For NewArrival and FeaturedProduct products, we don't have stock tracking
      if (productType === 'product' && product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      
      calculatedTotal += product.price * item.quantity;
      
      processedItems.push({
        ...item,
        productType
      });
    }

    console.log('Calculated total:', calculatedTotal);

    // Verify total amount matches
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      console.log('Total mismatch:', { calculatedTotal, receivedTotal: totalAmount });
      return res.status(400).json({ message: 'Total amount mismatch' });
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: processedItems,
      totalAmount,
      shippingDetails,
      paymentMethod: req.body.paymentMethod,
      status: 'pending'
    });

    console.log('Created order object:', order);

    // Update product stock (only for Product collection items)
    for (const item of processedItems) {
      if (item.productType === 'product') {
        const product = await Product.findById(item.product);
        if (product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity }
          });
        }
      }
      // For NewArrival and Featured products, we don't update stock
    }

    await order.save();
    console.log('Order saved successfully:', order);
    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    console.log('Fetching orders for user:', req.user._id);
    
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    console.log('Found orders:', orders.length);

    // Populate product details for each order's items
    const ordersWithProducts = await Promise.all(orders.map(async (order) => {
      const populatedItems = await Promise.all(order.items.map(async (item) => {
        try {
          let product;
          
          // Check which collection to use based on productType
          if (item.productType === 'newArrival') {
            product = await NewArrival.findById(item.product);
          } else {
            product = await Product.findById(item.product);
          }
          
          return {
            ...item.toObject(),
            name: product?.name || 'Product not found',
            image: product?.image || '',
            price: product?.price || 0
          };
        } catch (error) {
          console.error('Error populating product:', error);
          return {
            ...item.toObject(),
            name: 'Product not found',
            image: '',
            price: 0
          };
        }
      }));

      return {
        ...order.toObject(),
        items: populatedItems
      };
    }));

    console.log('Successfully populated orders with products');
    res.json(ordersWithProducts);
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    res.status(500).json({ 
      message: 'Error fetching user orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (req.user.role !== 'admin' && 
        (order.user._id ? order.user._id.toString() : order.user.toString()) !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Populate product details for each order's items
    const ordersWithProducts = await Promise.all(orders.map(async (order) => {
      const populatedItems = await Promise.all(order.items.map(async (item) => {
        let product;
        
        // Check which collection to use based on productType
        if (item.productType === 'newArrival') {
          product = await NewArrival.findById(item.product);
        } else {
          product = await Product.findById(item.product);
        }
        
        return {
          ...item.toObject(),
          name: product?.name || 'Product not found',
          image: product?.image || '',
          price: product?.price || 0
        };
      }));

      return {
        ...order.toObject(),
        items: populatedItems
      };
    }));

    res.json(ordersWithProducts);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ 
      message: 'Error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get order statistics (admin only)
export const getOrderStats = async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    const now = new Date();
    let startDate;

    // Calculate start date based on timeRange
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    // Get total orders and revenue
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate }
    });

    const orders = await Order.find({
      createdAt: { $gte: startDate }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get orders by status
    const pendingOrders = await Order.countDocuments({
      createdAt: { $gte: startDate },
      status: 'pending'
    });

    const processingOrders = await Order.countDocuments({
      createdAt: { $gte: startDate },
      status: 'processing'
    });

    const shippedOrders = await Order.countDocuments({
      createdAt: { $gte: startDate },
      status: 'shipped'
    });

    const deliveredOrders = await Order.countDocuments({
      createdAt: { $gte: startDate },
      status: 'delivered'
    });

    const cancelledOrders = await Order.countDocuments({
      createdAt: { $gte: startDate },
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
    console.error('Error getting order statistics:', error);
    res.status(500).json({ 
      message: 'Error fetching order statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to delete this order
    if (req.user.role !== 'admin' && 
        (order.user._id ? order.user._id.toString() : order.user.toString()) !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this order' });
    }

    // Restore product stock (only for Product collection items)
    for (const item of order.items) {
      if (item.productType === 'product') {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
      // For NewArrival and Featured products, we don't update stock
    }

    await order.deleteOne();
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      message: 'Error deleting order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to cancel this order
    if (req.user.role !== 'admin' && 
        (order.user._id ? order.user._id.toString() : order.user.toString()) !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }

    // Restore product stock (only for Product collection items)
    for (const item of order.items) {
      if (item.productType === 'product') {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
      // For NewArrival and Featured products, we don't update stock
    }

    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 