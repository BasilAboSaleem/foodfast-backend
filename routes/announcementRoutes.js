const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { requireAuth, isAdmin } = require('../middlewares/authMiddlewares');

// Get announcements (any authenticated user)
router.get('/', requireAuth, announcementController.getAnnouncements);

// Create announcement (admin only)
router.post('/', requireAuth, isAdmin, announcementController.createAnnouncement);

module.exports = router;
