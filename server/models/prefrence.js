const   mongoose  = require("mongoose");

// User preference model
const UserPreferenceSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: true,
      unique: true
    },
    preferredCategories: [{
      category: String,
      weight: Number // 0-1 indicating preference strength
    }],
    preferredLevels: [{
      level: String,
      weight: Number
    }],
    preferredLanguages: [{
      language: String,
      weight: Number
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  });
  
  module.exports = mongoose.model('UserPreference', UserPreferenceSchema);
  