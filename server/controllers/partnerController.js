import Partner from '../models/Partner.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all partners
// @route   GET /api/partners
// @access  Public
export const getPartners = asyncHandler(async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const query = includeInactive ? {} : { isActive: true };
    
    const partners = await Partner.find(query).sort({ order: 1 });
    res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ 
      message: 'Error fetching partners', 
      error: error.message 
    });
  }
});

// @desc    Get a partner by ID
// @route   GET /api/partners/:id
// @access  Public
export const getPartner = asyncHandler(async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    
    if (partner) {
      res.json(partner);
    } else {
      res.status(404);
      throw new Error('Partner not found');
    }
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({ 
      message: 'Error fetching partner', 
      error: error.message 
    });
  }
});

// @desc    Create a partner
// @route   POST /api/partners
// @access  Private/Admin
export const createPartner = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      link, 
      order, 
      isActive,
      startDate,
      endDate,
      seoMetadata
    } = req.body;

    let imageUrl = 'https://placehold.co/400x200?text=No+Image';

    // Handle image upload
    if (req.files && req.files.image && req.files.image[0]) {
      const result = await uploadToCloudinary(req.files.image[0]);
      imageUrl = result.secure_url;
    }

    const partner = new Partner({
      name,
      description,
      image: imageUrl,
      link,
      order: parseInt(order),
      isActive: isActive === 'true',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      seoMetadata: seoMetadata ? JSON.parse(seoMetadata) : {}
    });

    const savedPartner = await partner.save();
    res.status(201).json(savedPartner);
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a partner
// @route   PUT /api/partners/:id
// @access  Private/Admin
export const updatePartner = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      link, 
      order, 
      isActive,
      startDate,
      endDate,
      seoMetadata
    } = req.body;

    const partner = await Partner.findById(req.params.id);
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    // Handle image upload if a new image was provided
    if (req.files && req.files.image && req.files.image[0]) {
      // Delete old image from Cloudinary if it exists
      if (partner.image && !partner.image.includes('placehold.co')) {
        try {
          await deleteFromCloudinary(partner.image);
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
        }
      }

      // Upload new image
      const result = await uploadToCloudinary(req.files.image[0]);
      partner.image = result.secure_url;
    }

    // Update other fields
    partner.name = name || partner.name;
    partner.description = description || partner.description;
    partner.link = link || partner.link;
    partner.order = order ? parseInt(order) : partner.order;
    partner.isActive = isActive === 'true' ? true : isActive === 'false' ? false : partner.isActive;
    partner.startDate = startDate ? new Date(startDate) : partner.startDate;
    partner.endDate = endDate ? new Date(endDate) : partner.endDate;
    partner.seoMetadata = seoMetadata ? JSON.parse(seoMetadata) : partner.seoMetadata;

    const updatedPartner = await partner.save();
    res.json(updatedPartner);
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a partner
// @route   DELETE /api/partners/:id
// @access  Private/Admin
export const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    // Delete image from Cloudinary if it exists
    if (partner.image && !partner.image.includes('placehold.co')) {
      try {
        await deleteFromCloudinary(partner.image);
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError);
      }
    }

    await partner.remove();
    res.json({ message: 'Partner removed' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(400).json({ message: error.message });
  }
}; 