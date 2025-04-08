import SiteSettings from '../models/Settings.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Get settings
export const getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await SiteSettings.create({
        siteName: 'CareCorner',
        siteDescription: 'Your trusted healthcare partner',
        contactEmail: 'contact@carecorner.com',
        contactPhone: '+1 (555) 123-4567',
        address: '123 Healthcare St, Medical City, MC 12345',
        currency: 'USD',
        logo: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/default-logo',
        favicon: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/default-favicon'
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findOne();
    const updateData = { ...req.body };

    // Handle file uploads
    if (req.files) {
      if (req.files.logo) {
        const logoResult = await uploadToCloudinary(req.files.logo[0].path, 'settings');
        updateData.logo = logoResult.secure_url;
      }
      if (req.files.favicon) {
        const faviconResult = await uploadToCloudinary(req.files.favicon[0].path, 'settings');
        updateData.favicon = faviconResult.secure_url;
      }
    }

    if (settings) {
      // Update existing settings
      Object.assign(settings, updateData);
      await settings.save();
    } else {
      // Create new settings
      await SiteSettings.create(updateData);
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
}; 