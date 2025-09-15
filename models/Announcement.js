// models/Announcement.js
const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  audience: { 
    type: String, 
    enum: ['all', 'customers', 'drivers', 'restaurants'], 
    default: 'all' 
  },
  pinned: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
