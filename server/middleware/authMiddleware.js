const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    return res.json({
      success: false,
      message: 'Not authorized — no token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-password').lean();

    if (!user) {
      res.status(401);
      return res.json({
        success: false,
        message: 'Not authorized — user not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401);
      return res.json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }
    res.status(401);
    return res.json({
      success: false,
      message: 'Not authorized — invalid token',
    });
  }
});

module.exports = { protect };
