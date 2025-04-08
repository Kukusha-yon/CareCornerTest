import Product from '../models/Product.js';
import { validationResult } from 'express-validator';
import { uploadToCloudinary, deleteFromCloudinary, upload } from '../utils/cloudinary.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import FeaturedProduct from '../models/FeaturedProduct.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  try {
    const { 
      category, 
      search, 
      sort, 
      page = 1, 
      limit = 10,
      includeInactive = false
    } = req.query;

    // Build query
    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (!includeInactive) query.isActive = true;

    // Build sort options
    let sortOptions = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions = { createdAt: -1 }; // Default sort by newest
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.json({
      products,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: 'Error fetching products', 
      error: error.message 
    });
  }
});

// @desc    Get a product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      message: 'Error fetching product', 
      error: error.message 
    });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete main image from Cloudinary if it exists
    if (product.image && !product.image.includes('placehold.co')) {
      try {
        await deleteFromCloudinary(product.image);
      } catch (deleteError) {
        console.error('Error deleting main image:', deleteError);
      }
    }

    // Delete gallery images from Cloudinary
    for (const image of product.galleryImages) {
      if (image.url && !image.url.includes('placehold.co')) {
        try {
          await deleteFromCloudinary(image.url);
        } catch (deleteError) {
          console.error('Error deleting gallery image:', deleteError);
        }
      }
    }

    await product.remove();
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      stock,
      isActive,
      features,
      specifications,
      seoMetadata
    } = req.body;

    let imageUrl = 'https://placehold.co/400x200?text=No+Image';

    // Handle image upload
    if (req.files && req.files.image && req.files.image[0]) {
      const result = await uploadToCloudinary(req.files.image[0]);
      imageUrl = result.secure_url;
    }

    // Handle gallery images
    let galleryImages = [];
    if (req.files && req.files.galleryImages && req.files.galleryImages.length > 0) {
      for (const file of req.files.galleryImages) {
        const result = await uploadToCloudinary(file);
        galleryImages.push({ url: result.secure_url });
      }
    }

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      image: imageUrl,
      galleryImages,
      stock: parseInt(stock) || 0,
      isActive: isActive === 'true',
      features: features ? JSON.parse(features) : [],
      specifications: specifications ? JSON.parse(specifications) : {},
      seoMetadata: seoMetadata ? JSON.parse(seoMetadata) : {}
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      stock,
      isActive,
      features,
      specifications,
      seoMetadata
    } = req.body;

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle main image upload
    if (req.files && req.files.image && req.files.image[0]) {
      // Delete old image from Cloudinary if it exists
      if (product.image && !product.image.includes('placehold.co')) {
        try {
          await deleteFromCloudinary(product.image);
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
        }
      }

      // Upload new image
      const result = await uploadToCloudinary(req.files.image[0]);
      product.image = result.secure_url;
    }

    // Handle gallery images
    if (req.files && req.files.galleryImages && req.files.galleryImages.length > 0) {
      // Delete old gallery images from Cloudinary
      for (const image of product.galleryImages) {
        if (image.url && !image.url.includes('placehold.co')) {
          try {
            await deleteFromCloudinary(image.url);
          } catch (deleteError) {
            console.error('Error deleting old gallery image:', deleteError);
          }
        }
      }

      // Upload new gallery images
      product.galleryImages = [];
      for (const file of req.files.galleryImages) {
        const result = await uploadToCloudinary(file);
        product.galleryImages.push({ url: result.secure_url });
      }
    }

    // Update other fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price ? parseFloat(price) : product.price;
    product.category = category || product.category;
    product.stock = stock ? parseInt(stock) : product.stock;
    product.isActive = isActive === 'true' ? true : isActive === 'false' ? false : product.isActive;
    product.features = features ? JSON.parse(features) : product.features;
    product.specifications = specifications ? JSON.parse(specifications) : product.specifications;
    product.seoMetadata = seoMetadata ? JSON.parse(seoMetadata) : product.seoMetadata;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
export const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(5);
  res.json(products);
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching featured products...');
    
    // Get all featured products from the FeaturedProduct collection
    const featuredProducts = await FeaturedProduct.find({ isActive: true })
      .sort({ order: 1 })
      .populate('productId')
      .limit(10);
    
    console.log('Found featured products:', featuredProducts.length);
    console.log('First featured product:', featuredProducts[0]);

    // Format the response
    const formattedProducts = featuredProducts.map(featuredProduct => {
      if (!featuredProduct.productId) {
        console.error('Featured product has no productId:', featuredProduct._id);
        return null;
      }
      
      const product = featuredProduct.productId;
      return {
        ...product.toObject(),
        _id: product._id, // Use the actual product ID as the main ID
        featuredProductId: featuredProduct._id,
        featuredTitle: featuredProduct.title,
        featuredDescription: featuredProduct.description,
        featuredImage: featuredProduct.image,
        featuredGalleryImages: featuredProduct.galleryImages,
        featuredOrder: featuredProduct.order,
        featuredButtonText: featuredProduct.buttonText,
        featuredHighlightText: featuredProduct.highlightText
      };
    }).filter(Boolean); // Remove any null values
    
    console.log('Formatted products:', formattedProducts.length);
    console.log('First formatted product:', formattedProducts[0]);
    
    res.json(formattedProducts);
  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error fetching featured products',
      error: error.message,
      stack: error.stack
    });
  }
});

// @desc    Get best sellers
// @route   GET /api/products/best-sellers
// @access  Public
export const getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ isBestSeller: true })
    .sort({ rating: -1 })
    .limit(10);
  res.json(products);
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;
  console.log('Search query received:', q);
  
  // First, let's check if there are any products in the database
  const totalProducts = await Product.countDocuments({});
  console.log('Total products in database:', totalProducts);
  
  // Get all products to check their categories
  const allProducts = await Product.find({}).select('category name');
  console.log('Available categories:', [...new Set(allProducts.map(p => p.category))]);
  
  const searchQuery = {
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { brand: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } },
      // Add more lenient search for category
      { category: { $regex: q.replace(/s$/, ''), $options: 'i' } }, // Try without 's'
      { category: { $regex: q + 's', $options: 'i' } }, // Try with 's'
    ],
  };
  
  console.log('Search query:', JSON.stringify(searchQuery, null, 2));
  
  const products = await Product.find(searchQuery).sort({ createdAt: -1 });
  console.log('Number of products found:', products.length);
  
  if (products.length > 0) {
    console.log('First product found:', {
      name: products[0].name,
      category: products[0].category,
      description: products[0].description
    });
  } else {
    console.log('No products found matching the search criteria');
  }
  
  res.json(products);
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 