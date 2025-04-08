import mongoose from 'mongoose';

const marketNewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  summary: {
    type: String,
    required: [true, 'Summary is required'],
    trim: true
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true
  },
  sourceUrl: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: 'https://placehold.co/400x200?text=No+Image'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Market', 'Economy', 'Technology', 'Healthcare', 'Other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  publishDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  seoMetadata: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Add text index for search functionality
marketNewsSchema.index({ 
  title: 'text', 
  content: 'text', 
  summary: 'text', 
  tags: 'text' 
});

const MarketNews = mongoose.model('MarketNews', marketNewsSchema);

export default MarketNews; 