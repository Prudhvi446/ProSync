const jwt = require('jsonwebtoken');
const User = require('../models/User');

const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId).select('name email avatar').lean();

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

    socket.on('join:workspace', (workspaceId) => {
      if (!workspaceId) return;

      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });

      socket.join(workspaceId);
      console.log(`${socket.user.name} joined workspace room: ${workspaceId}`);
    });

    socket.on('leave:workspace', (workspaceId) => {
      if (!workspaceId) return;
      socket.leave(workspaceId);
      console.log(`${socket.user.name} left workspace room: ${workspaceId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.user.name} (${reason})`);
    });
  });

  return io;
};

module.exports = { initializeSocket };
