import mongoose from 'mongoose';

const appSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
appSettingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const AppSetting = mongoose.model('AppSetting', appSettingSchema);

export default AppSetting; 