import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    manufacturer: {
      type: String,
      default: '',
    },
    modelNumber: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      required: true,
    },
    galleryImages: [{
      url: { type: String },
      alt: { type: String },
      order: { type: Number, default: 0 }
    }],
    brand: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    detailedDescription: {
      type: String,
      default: '',
    },
    features: [{
      type: String,
    }],
    technicalSpecs: {
      type: Map,
      of: String,
      default: {},
    },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      unit: { type: String, default: 'inches' }
    },
    weight: {
      value: { type: Number },
      unit: { type: String, default: 'pounds' }
    },
    warranty: {
      duration: { type: Number },
      unit: { type: String, default: 'months' },
      description: { type: String }
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    variants: [{
      name: { type: String },
      options: [String],
      price: { type: Number },
      sku: { type: String },
      stock: { type: Number }
    }],
    tags: [String],
    seoMetadata: {
      title: { type: String },
      description: { type: String },
      keywords: [String]
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true
  }
);

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product; 