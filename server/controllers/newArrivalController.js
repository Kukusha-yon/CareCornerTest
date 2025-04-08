import NewArrival from '../models/NewArrival.js';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../utils/cloudinary.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';

// @desc    Get all new arrivals
// @route   GET /api/new-arrivals
// @access  Public
const getAllNewArrivals = asyncHandler(async (req, res) => {
  console.log('Fetching all new arrivals...');
  
  const newArrivals = await NewArrival.find()
    .sort({ createdAt: -1 });
  
  console.log(`Found ${newArrivals.length} new arrivals:`, newArrivals);
  
  res.status(200).json(newArrivals);
});

// @desc    Get a single new arrival by ID
// @route   GET /api/new-arrivals/:id
// @access  Public
const getNewArrivalById = asyncHandler(async (req, res) => {
  console.log('Fetching new arrival with ID:', req.params.id);
  
  // Check if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    console.log('Invalid MongoDB ObjectId format:', req.params.id);
    throw new AppError('Invalid new arrival ID format', 400);
  }
  
  const newArrival = await NewArrival.findById(req.params.id);
  console.log('New arrival found:', newArrival);
  
  if (!newArrival) {
    console.log('New arrival not found');
    throw new AppError('New arrival not found', 404);
  }
  
  res.status(200).json(newArrival);
});

// @desc    Create a new arrival
// @route   POST /api/new-arrivals
// @access  Private/Admin
const createNewArrival = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      detailedDescription,
      price,
      category,
      isActive,
      startDate,
      endDate,
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

    const newArrival = new NewArrival({
      name,
      description,
      detailedDescription,
      image: imageUrl,
      galleryImages,
      price,
      category,
      isActive,
      startDate,
      endDate,
      features: features ? JSON.parse(features) : [],
      specifications: specifications ? JSON.parse(specifications) : {},
      seoMetadata: seoMetadata ? JSON.parse(seoMetadata) : {}
    });

    const savedNewArrival = await newArrival.save();
    res.status(201).json(savedNewArrival);
  } catch (error) {
    console.error('Error creating new arrival:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a new arrival
// @route   PUT /api/new-arrivals/:id
// @access  Private/Admin
const updateNewArrival = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      detailedDescription,
      price,
      category,
      isActive,
      startDate,
      endDate,
      features,
      specifications,
      seoMetadata
    } = req.body;

    const newArrival = await NewArrival.findById(req.params.id);
    if (!newArrival) {
      throw new AppError('New arrival not found', 404);
    }

    // Handle main image upload
    if (req.files && req.files.image && req.files.image[0]) {
      // Delete old image if it exists and is not the default
      if (newArrival.image && !newArrival.image.includes('placehold.co')) {
        const publicId = getPublicIdFromUrl(newArrival.image);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
      const result = await uploadToCloudinary(req.files.image[0]);
      newArrival.image = result.secure_url;
    }

    // Handle gallery images
    if (req.files && req.files.galleryImages && req.files.galleryImages.length > 0) {
      // Delete old gallery images
      for (const image of newArrival.galleryImages) {
        const publicId = getPublicIdFromUrl(image.url);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }

      const galleryImages = [];
      for (const file of req.files.galleryImages) {
        const result = await uploadToCloudinary(file);
        galleryImages.push({ url: result.secure_url });
      }
      newArrival.galleryImages = galleryImages;
    }

    // Update other fields
    newArrival.name = name || newArrival.name;
    newArrival.description = description || newArrival.description;
    newArrival.detailedDescription = detailedDescription || newArrival.detailedDescription;
    newArrival.price = price || newArrival.price;
    newArrival.category = category || newArrival.category;
    newArrival.isActive = isActive !== undefined ? isActive : newArrival.isActive;
    newArrival.startDate = startDate || newArrival.startDate;
    newArrival.endDate = endDate || newArrival.endDate;
    newArrival.features = features ? JSON.parse(features) : newArrival.features;
    newArrival.specifications = specifications ? JSON.parse(specifications) : newArrival.specifications;
    newArrival.seoMetadata = seoMetadata ? JSON.parse(seoMetadata) : newArrival.seoMetadata;

    const updatedNewArrival = await newArrival.save();
    res.status(200).json(updatedNewArrival);
  } catch (error) {
    console.error('Error updating new arrival:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a new arrival
// @route   DELETE /api/new-arrivals/:id
// @access  Private/Admin
const deleteNewArrival = asyncHandler(async (req, res) => {
  try {
    const newArrival = await NewArrival.findById(req.params.id);
    if (!newArrival) {
      throw new AppError('New arrival not found', 404);
    }

    // Delete main image if it exists and is not the default
    if (newArrival.image && !newArrival.image.includes('placehold.co')) {
      const publicId = getPublicIdFromUrl(newArrival.image);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    // Delete gallery images
    for (const image of newArrival.galleryImages) {
      const publicId = getPublicIdFromUrl(image.url);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    await NewArrival.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'New arrival deleted successfully' });
  } catch (error) {
    console.error('Error deleting new arrival:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all new arrivals (admin)
// @route   GET /api/new-arrivals/admin
// @access  Private/Admin
const getAdminNewArrivals = asyncHandler(async (req, res) => {
  console.log('Fetching admin new arrivals...');
  
  // Check if user is authenticated and is an admin
  if (!req.user || req.user.role !== 'admin') {
    console.log('User not authenticated or not an admin:', req.user);
    throw new AppError('Not authorized as an admin', 403);
  }
  
  // Fetch new arrivals
  const newArrivals = await NewArrival.find()
    .sort({ createdAt: -1 });
  
  console.log(`Found ${newArrivals.length} new arrivals`);
  
  res.status(200).json(newArrivals);
});

export {
  getAllNewArrivals,
  getNewArrivalById,
  createNewArrival,
  updateNewArrival,
  deleteNewArrival,
  getAdminNewArrivals
}; 