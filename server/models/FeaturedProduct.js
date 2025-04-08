import mongoose from 'mongoose';

const featuredProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  detailedDescription: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  galleryImages: [{
    url: {
      type: String,
      required: true
    }
  }],
  link: {
    type: String,
    required: [true, 'Link is required'],
    trim: true
  },
  order: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Order must be a non-negative number']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  buttonText: {
    type: String,
    trim: true
  },
  highlightText: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  specifications: {
    type: Map,
    of: String
  },
  seoMetadata: {
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    keywords: [{
      type: String,
      trim: true
    }]
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
featuredProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const FeaturedProduct = mongoose.model('FeaturedProduct', featuredProductSchema);

export default FeaturedProduct; 