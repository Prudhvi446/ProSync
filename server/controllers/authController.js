const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { generateTokens } = require('../utils/generateTokens');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    return res.json({
      success: false,
      message: 'Please provide name, email, and password',
    });
  }

  if (password.length < 6) {
    res.status(400);
    return res.json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() }).lean();
  if (existingUser) {
    res.status(400);
    return res.json({
      success: false,
      message: 'A user with this email already exists',
    });
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
  });

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    workspaces: user.workspaces,
    createdAt: user.createdAt,
  };

  res.status(201).json({
    success: true,
    data: {
      user: userResponse,
      accessToken,
      refreshToken,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return res.json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    res.status(401);
    return res.json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  if (!user.password) {
    res.status(401);
    return res.json({
      success: false,
      message: 'This account uses Google login. Please sign in with Google.',
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    return res.json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    workspaces: user.workspaces,
    createdAt: user.createdAt,
  };

  res.status(200).json({
    success: true,
    data: {
      user: userResponse,
      accessToken,
      refreshToken,
    },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400);
    return res.json({
      success: false,
      message: 'Refresh token is required',
    });
  }

  const storedToken = await RefreshToken.findOne({ token: refreshToken });
  if (!storedToken) {
    res.status(401);
    return res.json({
      success: false,
      message: 'Invalid refresh token',
    });
  }

  if (storedToken.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: storedToken._id });
    res.status(401);
    return res.json({
      success: false,
      message: 'Refresh token has expired',
    });
  }

  await RefreshToken.deleteOne({ _id: storedToken._id });

  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(storedToken.user);

  res.status(200).json({
    success: true,
    data: {
      accessToken,
      refreshToken: newRefreshToken,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const redirectUrl = `${process.env.CLIENT_URL}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
  res.redirect(redirectUrl);
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('workspaces', 'name slug')
    .lean();

  if (!user) {
    res.status(404);
    return res.json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

module.exports = { register, login, refresh, logout, googleCallback, getMe };
