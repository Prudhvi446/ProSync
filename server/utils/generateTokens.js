const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const RefreshToken = require('../models/RefreshToken');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
};

const generateRefreshToken = async (userId) => {
  const token = uuidv4();

  const expiresAt = new Date();
  const daysMatch = (process.env.JWT_REFRESH_EXPIRES || '7d').match(/(\d+)d/);
  const days = daysMatch ? parseInt(daysMatch[1], 10) : 7;
  expiresAt.setDate(expiresAt.getDate() + days);

  await RefreshToken.create({
    token,
    user: userId,
    expiresAt,
  });

  return token;
};

const generateTokens = async (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = await generateRefreshToken(userId);
  return { accessToken, refreshToken };
};

module.exports = { generateAccessToken, generateRefreshToken, generateTokens };
