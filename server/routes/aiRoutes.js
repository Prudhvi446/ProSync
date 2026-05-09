const express = require('express');
const { getSummary } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/summary', getSummary);

module.exports = router;
