import FeaturedProduct from '../models/FeaturedProduct.js';
import { validationResult } from 'express-validator';
import { uploadToCloudinary, deleteFromCloudinary, upload } from '../utils/cloudinary.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

// @desc    Get all featured products
// @route   GET /api/featured-products
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const query = includeInactive ? {} : { isActive: true };
    
    const featuredProducts = await FeaturedProduct.find(query)
      .sort({ order: 1 })
      .populate('productId');

    const formattedProducts = featuredProducts.map(product => {
      if (!product.productId) {
        return null;
      }
      return {
        _id: product._id,
        productId: product.productId._id,
        name: product.productId.name,
        price: product.productId.price,
        description: product.productId.description,
        image: product.productId.image,
        featuredTitle: product.title,
        featuredDescription: product.description,
        featuredImage: product.image,
        featuredGalleryImages: product.galleryImages,
        featuredOrder: product.order,
        featuredButtonText: product.buttonText,
        featuredHighlightText: product.highlightText,
        category: product.productId.category,
        isActive: product.isActive,
        startDate: product.startDate,
        endDate: product.endDate,
        createdAt: product.createdAt
      };
    }).filter(Boolean); // Remove any null entries

    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ 
      message: 'Error fetching featured products', 
      error: error.message 
    });
  }
});

// @desc    Get a featured product by ID
// @route   GET /api/featured-products/:id
// @access  Public
export const getFeaturedProduct = asyncHandler(async (req, res) => {
  try {
    const featuredProduct = await FeaturedProduct.findById(req.params.id).populate('productId');
    
    if (featuredProduct) {
      res.json(featuredProduct);
    } else {
      res.status(404);
      throw new Error('Featured product not found');
    }
  } catch (error) {
    console.error('Error fetching featured product:', error);
    res.status(500).json({ 
      message: 'Error fetching featured product', 
      error: error.message 
    });
  }
});

// @desc    Get a featured product by product ID
// @route   GET /api/featured-products/product/:productId
// @access  Public
export const getFeaturedProductByProductId = asyncHandler(async (req, res) => {
  try {
    console.log(`Searching for featured product with productId: ${req.params.productId}`);
    
    const featuredProduct = await FeaturedProduct.findOne({ 
      productId: req.params.productId,
      isActive: true 
    }).populate('productId');
    
    if (featuredProduct) {
      console.log(`Found featured product: ${featuredProduct._id}`);
      res.json({
        _id: featuredProduct._id,
        featuredTitle: featuredProduct.title,
        featuredDescription: featuredProduct.description,
        featuredImage: featuredProduct.image,
        featuredGalleryImages: featuredProduct.galleryImages,
        featuredOrder: featuredProduct.order,
        featuredButtonText: featuredProduct.buttonText,
        featuredHighlightText: featuredProduct.highlightText
      });
    } else {
      // Instead of throwing an error, just return a 404 response
      console.log(`No featured product found for productId: ${req.params.productId}`);
      return res.status(404).json({ message: 'Featured product not found' });
    }
  } catch (error) {
    console.error('Error fetching featured product by product ID:', error);
    // Return a proper error response, don't throw
    return res.status(500).json({ 
      message: 'Error fetching featured product by product ID', 
      error: error.message 
    });
  }
});

// @desc    Create a featured product
// @route   POST /api/featured-products
// @access  Private/Admin
export const createFeaturedProduct = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      detailedDescription,
      link, 
      order, 
      isActive,
      startDate,
      endDate,
      productId,
      buttonText,
      highlightText,
      features,
      specifications,
      seoMetadata
    } = req.body;

    let imageUrl = 'https://placehold.co/400x200?text=No+Image';

    // Handle main image upload
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

    const featuredProduct = new FeaturedProduct({
      title,
      description,
      detailedDescription,
      image: imageUrl,
      galleryImages,
      link,
      order: parseInt(order),
      isActive: isActive === 'true',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      productId,
      buttonText,
      highlightText,
      features: features ? JSON.parse(features) : [],
      specifications: specifications ? JSON.parse(specifications) : {},
      seoMetadata: seoMetadata ? JSON.parse(seoMetadata) : {}
    });

    const savedFeaturedProduct = await featuredProduct.save();
    res.status(201).json(savedFeaturedProduct);
  } catch (error) {
    console.error('Error creating featured product:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a featured product
// @route   PUT /api/featured-products/:id
// @access  Private/Admin
export const updateFeaturedProduct = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      detailedDescription,
      link, 
      order, 
      isActive,
      startDate,
      endDate,
      buttonText,
      highlightText,
      features,
      specifications,
      seoMetadata,
      productId
    } = req.body;
    
    const imageFile = req.files?.image?.[0];
    const galleryFiles = req.files?.galleryImages || [];
    const featuredProduct = await FeaturedProduct.findById(req.params.id);

    if (!featuredProduct) {
      return res.status(404).json({ message: 'Featured product not found' });
    }

    // If a new image is uploaded
    if (imageFile) {
      // Delete the old image from Cloudinary
      const publicId = featuredProduct.image.split('/').pop().split('.')[0];
      await deleteFromCloudinary(`carecorner-featured-products/${publicId}`);
      
      // Upload new image
      const result = await uploadToCloudinary(imageFile.path, 'carecorner-featured-products');
      
      featuredProduct.image = result.secure_url;
    }

    // Handle gallery images
    if (galleryFiles.length > 0) {
      // Delete old gallery images from Cloudinary
      for (const image of featuredProduct.galleryImages || []) {
        const publicId = image.url.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`carecorner-featured-products-gallery/${publicId}`);
      }
      
      // Upload new gallery images
      const galleryImages = [];
      for (const file of galleryFiles) {
        const galleryResult = await uploadToCloudinary(file.path, 'carecorner-featured-products-gallery');
        galleryImages.push({ url: galleryResult.secure_url });
      }
      
      featuredProduct.galleryImages = galleryImages;
    }

    // Parse JSON fields
    const parsedFeatures = features ? JSON.parse(features) : featuredProduct.features || [];
    const parsedSpecifications = specifications ? JSON.parse(specifications) : featuredProduct.specifications || {};
    const parsedSeoMetadata = seoMetadata ? JSON.parse(seoMetadata) : featuredProduct.seoMetadata || {};

    // Update other fields
    featuredProduct.title = title || featuredProduct.title;
    featuredProduct.description = description || featuredProduct.description;
    featuredProduct.detailedDescription = detailedDescription || featuredProduct.detailedDescription;
    featuredProduct.link = link || featuredProduct.link;
    featuredProduct.order = parseInt(order) || featuredProduct.order;
    featuredProduct.isActive = isActive === 'true' ? true : isActive === 'false' ? false : featuredProduct.isActive;
    featuredProduct.startDate = startDate || featuredProduct.startDate;
    featuredProduct.endDate = endDate || featuredProduct.endDate;
    featuredProduct.buttonText = buttonText || featuredProduct.buttonText;
    featuredProduct.highlightText = highlightText || featuredProduct.highlightText;
    featuredProduct.features = parsedFeatures;
    featuredProduct.specifications = parsedSpecifications;
    featuredProduct.seoMetadata = parsedSeoMetadata;
    featuredProduct.productId = productId || featuredProduct.productId;

    await featuredProduct.save();
    res.json(featuredProduct);
  } catch (error) {
    console.error('Error updating featured product:', error);
    res.status(500).json({ message: 'Error updating featured product', error: error.message });
  }
};

// @desc    Delete a featured product
// @route   DELETE /api/featured-products/:id
// @access  Private/Admin
export const deleteFeaturedProduct = async (req, res) => {
  try {
    const featuredProduct = await FeaturedProduct.findById(req.params.id);
    
    if (!featuredProduct) {
      return res.status(404).json({ message: 'Featured product not found' });
    }
    
    // Delete image from Cloudinary
    const publicId = featuredProduct.image.split('/').pop().split('.')[0];
    await deleteFromCloudinary(`carecorner-featured-products/${publicId}`);
    
    // Delete gallery images from Cloudinary
    for (const image of featuredProduct.galleryImages || []) {
      const publicId = image.url.split('/').pop().split('.')[0];
      await deleteFromCloudinary(`carecorner-featured-products-gallery/${publicId}`);
    }
    
    await FeaturedProduct.findByIdAndDelete(req.params.id);
    res.json({ message: 'Featured product removed' });
  } catch (error) {
    console.error('Error deleting featured product:', error);
    res.status(500).json({ message: 'Error deleting featured product', error: error.message });
  }
};

// @desc    Update featured product order
// @route   PUT /api/featured-products/:id/order
// @access  Private/Admin
export const updateFeaturedProductOrder = async (req, res) => {
  try {
    const { order } = req.body;
    const featuredProduct = await FeaturedProduct.findById(req.params.id);
    
    if (!featuredProduct) {
      return res.status(404).json({ message: 'Featured product not found' });
    }
    
    featuredProduct.order = parseInt(order);
    const updatedFeaturedProduct = await featuredProduct.save();
    
    res.json(updatedFeaturedProduct);
  } catch (error) {
    console.error('Error updating featured product order:', error);
    res.status(500).json({ message: 'Error updating featured product order', error: error.message });
  }
}; 