import mongoose from 'mongoose';

const newArrivalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  detailedDescription: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: 'https://placehold.co/400x200?text=No+Image'
  },
  galleryImages: [{
    url: {
      type: String,
      required: true
    }
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required']
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
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
newArrivalSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const NewArrival = mongoose.model('NewArrival', newArrivalSchema);

export default NewArrival; 