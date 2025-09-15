// controllers/announcementController.js
const Announcement = require('../models/Announcement');


exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, audience = 'all', pinned = false } = req.body;
    const createdBy = req.user._id; 

    const announcement = await Announcement.create({
      title, message, audience, pinned, createdBy
    });

   
    const io = req.app.get('io');
    if (io) {
 
      io.of('/announcements').emit('announcement:new', {
        _id: announcement._id,
        title: announcement.title,
        message: announcement.message,
        audience: announcement.audience,
        pinned: announcement.pinned,
        createdAt: announcement.createdAt
      });
    }

    return res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    console.error('createAnnouncement error', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};


exports.getAnnouncements = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const skip = (page - 1) * limit;

    // Optionally, client can request audience filter
    const audienceFilter = req.query.audience; // 'all'|'customers'...
    const filter = {};
    if (audienceFilter) filter.audience = audienceFilter;

    const announcements = await Announcement.find(filter)
      .sort({ pinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Announcement.countDocuments(filter);

    return res.json({ success: true, data: announcements, meta: { total, page, limit } });
  } catch (err) {
    console.error('getAnnouncements error', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
