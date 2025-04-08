import AppSetting from '../models/Setting.js';

// Get all settings
export const getSettings = async (req, res) => {
  try {
    const settings = await AppSetting.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

// Get a specific setting
export const getSetting = async (req, res) => {
  try {
    const setting = await AppSetting.findOne({ key: req.params.key });
    if (setting) {
      res.json(setting);
    } else {
      res.status(404).json({ message: 'Setting not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching setting', error: error.message });
  }
};

// Update a setting
export const updateSetting = async (req, res) => {
  try {
    const { value } = req.body;
    const setting = await AppSetting.findOneAndUpdate(
      { key: req.params.key },
      { value },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error updating setting', error: error.message });
  }
};

// Initialize default settings
export const initializeSettings = async () => {
  try {
    const defaultSettings = [
      {
        key: 'acceptOrders',
        value: true,
        description: 'Whether the system is accepting new orders'
      },
      {
        key: 'contactInfo',
        value: {
          telegram: 'https://t.me/carecorner',
          facebook: 'https://facebook.com/carecorner',
          phone: '25192345677',
          email: 'contact@carecorner.com'
        },
        description: 'Contact information for when orders are not accepted'
      }
    ];

    for (const setting of defaultSettings) {
      await AppSetting.findOneAndUpdate(
        { key: setting.key },
        setting,
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error initializing settings:', error);
  }
}; 