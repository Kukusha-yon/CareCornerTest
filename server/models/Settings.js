import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    default: 'CareCorner'
  },
  siteDescription: {
    type: String,
    required: true,
    default: 'Your trusted healthcare partner'
  },
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
  },
  logo: {
    type: String,
    required: true
  },
  favicon: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
siteSettingsSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    if (count > 0) {
      throw new Error('Only one settings document can exist');
    }
  }
  next();
});

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings; 