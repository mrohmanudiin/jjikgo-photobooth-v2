const { validateSession } = require('../config/auth');

/**
 * Setup Socket.io with branch-based rooms and authentication
 */
function setupSocket(io) {
  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        socket.user = null;
        return next();
      }

      const user = await validateSession(token);
      if (!user) {
        socket.user = null;
        return next();
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next();
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;

    if (user) {
      console.log(`✅ Socket connected: ${user.username} (${user.role}) [${socket.id}]`);

      if (user.role === 'admin') {
        socket.join('room:admin');
        // Admin can join specific branch rooms for monitoring
        socket.on('admin:join_branch', (branchId) => {
          socket.join(`room:branch_${branchId}`);
          console.log(`Admin ${user.username} joined room:branch_${branchId}`);
        });
        socket.on('admin:leave_branch', (branchId) => {
          socket.leave(`room:branch_${branchId}`);
        });
      } else if (user.branchId) {
        socket.join(`room:branch_${user.branchId}`);
        console.log(`${user.username} joined room:branch_${user.branchId}`);
      }
    } else {
      console.log(`📡 Anonymous socket connected: ${socket.id}`);
    }

    // Public: join a tracking room for QR queue tracking
    socket.on('track:join', (queueIdentifier) => {
      socket.join(`room:track_${queueIdentifier}`);
    });

    socket.on('disconnect', () => {
      if (user) {
        console.log(`❌ Socket disconnected: ${user.username} [${socket.id}]`);
      }
    });
  });

  return io;
}

/**
 * Emit queue update to a specific branch room + admin
 */
function emitQueueUpdate(io, branchId, action, data) {
  const payload = { action, branchId, data, timestamp: new Date().toISOString() };
  if (branchId) {
    io.to(`room:branch_${branchId}`).emit('queueUpdated', payload);
  }
  io.to('room:admin').emit('queueUpdated', payload);
}

/**
 * Emit print request to a specific branch room + admin
 */
function emitPrintRequest(io, branchId, data) {
  const payload = { branchId, data, timestamp: new Date().toISOString() };
  if (branchId) {
    io.to(`room:branch_${branchId}`).emit('printRequested', payload);
  }
  io.to('room:admin').emit('printRequested', payload);
}

/**
 * Emit admin-level events (branch/user CRUD, etc.) to admin room only
 */
function emitToAdmin(io, action, data) {
  if (!io) return;
  io.to('room:admin').emit('adminEvent', { action, data, timestamp: new Date().toISOString() });
}

module.exports = { setupSocket, emitQueueUpdate, emitPrintRequest, emitToAdmin };
