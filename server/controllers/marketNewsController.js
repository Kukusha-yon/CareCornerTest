import MarketNews from '../models/MarketNews.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all market news
// @route   GET /api/market-news
// @access  Public
export const getMarketNews = asyncHandler(async (req, res) => {
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
      query.$text = { $search: search };
    }
    if (!includeInactive) query.isActive = true;

    // Build sort options
    let sortOptions = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions = { publishDate: -1 }; // Default sort by newest
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const marketNews = await MarketNews.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await MarketNews.countDocuments(query);

    res.json({
      marketNews,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching market news:', error);
    res.status(500).json({ 
      message: 'Error fetching market news', 
      error: error.message 
    });
  }
});

// @desc    Get a market news by ID
// @route   GET /api/market-news/:id
// @access  Public
export const getMarketNewsById = asyncHandler(async (req, res) => {
  try {
    const marketNews = await MarketNews.findById(req.params.id);
    
    if (marketNews) {
      res.json(marketNews);
    } else {
      res.status(404);
      throw new Error('Market news not found');
    }
  } catch (error) {
    console.error('Error fetching market news:', error);
    res.status(500).json({ 
      message: 'Error fetching market news', 
      error: error.message 
    });
  }
});

// @desc    Create a market news
// @route   POST /api/market-news
// @access  Private/Admin
export const createMarketNews = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      summary, 
      source, 
      sourceUrl, 
      category, 
      tags,
      publishDate,
      isActive,
      seoMetadata
    } = req.body;

    let imageUrl = 'https://placehold.co/400x200?text=No+Image';

    // Handle image upload
    if (req.files && req.files.image && req.files.image[0]) {
      const result = await uploadToCloudinary(req.files.image[0]);
      imageUrl = result.secure_url;
    }

    const marketNews = new MarketNews({
      title,
      content,
      summary,
      source,
      sourceUrl,
      image: imageUrl,
      category,
      tags: tags ? JSON.parse(tags) : [],
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      isActive: isActive === 'true',
      seoMetadata: seoMetadata ? JSON.parse(seoMetadata) : {}
    });

    const savedMarketNews = await marketNews.save();
    res.status(201).json(savedMarketNews);
  } catch (error) {
    console.error('Error creating market news:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a market news
// @route   PUT /api/market-news/:id
// @access  Private/Admin
export const updateMarketNews = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      summary, 
      source, 
      sourceUrl, 
      category, 
      tags,
      publishDate,
      isActive,
      seoMetadata
    } = req.body;

    const marketNews = await MarketNews.findById(req.params.id);
    
    if (!marketNews) {
      return res.status(404).json({ message: 'Market news not found' });
    }

    // Handle image upload
    if (req.files && req.files.image && req.files.image[0]) {
      // Delete old image from Cloudinary if it exists
      if (marketNews.image && !marketNews.image.includes('placehold.co')) {
        try {
          await deleteFromCloudinary(marketNews.image);
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
        }
      }

      // Upload new image
      const result = await uploadToCloudinary(req.files.image[0]);
      marketNews.image = result.secure_url;
    }

    // Update other fields
    marketNews.title = title || marketNews.title;
    marketNews.content = content || marketNews.content;
    marketNews.summary = summary || marketNews.summary;
    marketNews.source = source || marketNews.source;
    marketNews.sourceUrl = sourceUrl || marketNews.sourceUrl;
    marketNews.category = category || marketNews.category;
    marketNews.tags = tags ? JSON.parse(tags) : marketNews.tags;
    marketNews.publishDate = publishDate ? new Date(publishDate) : marketNews.publishDate;
    marketNews.isActive = isActive === 'true' ? true : isActive === 'false' ? false : marketNews.isActive;
    marketNews.seoMetadata = seoMetadata ? JSON.parse(seoMetadata) : marketNews.seoMetadata;

    const updatedMarketNews = await marketNews.save();
    res.json(updatedMarketNews);
  } catch (error) {
    console.error('Error updating market news:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a market news
// @route   DELETE /api/market-news/:id
// @access  Private/Admin
export const deleteMarketNews = async (req, res) => {
  try {
    const marketNews = await MarketNews.findById(req.params.id);
    
    if (!marketNews) {
      return res.status(404).json({ message: 'Market news not found' });
    }

    // Delete image from Cloudinary if it exists
    if (marketNews.image && !marketNews.image.includes('placehold.co')) {
      try {
        await deleteFromCloudinary(marketNews.image);
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError);
      }
    }

    await marketNews.remove();
    res.json({ message: 'Market news removed' });
  } catch (error) {
    console.error('Error deleting market news:', error);
    res.status(400).json({ message: error.message });
  }
}; 