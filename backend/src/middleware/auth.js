const { validateSession } = require('../config/auth');

/**
 * Authenticate user from session token in cookie or Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await validateSession(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles - e.g. ['admin', 'cashier']
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

/**
 * Branch isolation middleware — ensures non-admin users can only access their own branch data.
 * Injects req.branchFilter for controllers to use.
 */
const branchScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role === 'admin') {
    // Admin can access everything; optionally filter by query param
    req.branchFilter = req.query.branch_id ? parseInt(req.query.branch_id) : null;
  } else {
    // Non-admin users are scoped to their assigned branch
    if (!req.user.branchId) {
      return res.status(403).json({ error: 'User has no assigned branch' });
    }
    req.branchFilter = req.user.branchId;
  }

  next();
};

module.exports = { authenticate, requireRole, branchScope };
