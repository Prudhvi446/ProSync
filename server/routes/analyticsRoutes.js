const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { verifyWorkspaceMember } = require('../middleware/workspaceMiddleware');

const router = express.Router();

router.use(protect);

router.get('/:workspaceId', verifyWorkspaceMember, getAnalytics);

module.exports = router;
