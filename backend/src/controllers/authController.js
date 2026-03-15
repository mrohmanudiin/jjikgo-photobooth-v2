const { db } = require('../config/db');
const { users, authSessions } = require('../db/schema');
const { hashPassword, comparePassword, createSession, deleteSession } = require('../config/auth');
const { eq } = require('drizzle-orm');

/**
 * POST /api/auth/login
 * Access: Public
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
      with: { branch: true },
    });

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Support both hashed and legacy plaintext passwords
    let passwordMatch = false;
    if (user.password.startsWith('$2')) {
      passwordMatch = await comparePassword(password, user.password);
    } else {
      // Legacy plaintext comparison
      passwordMatch = (password === user.password);
    }

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create session
    const session = await createSession(user.id);

    // Set session cookie
    res.cookie('session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      id: user.id,
      username: user.username,
      full_name: user.fullName,
      role: user.role,
      branch_id: user.branchId,
      branch: user.branch,
      token: session.token, // Also return token for clients that use Authorization header
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * POST /api/auth/logout
 * Access: Authenticated
 */
exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      await deleteSession(token);
    }
    res.clearCookie('session_token');
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

/**
 * GET /api/auth/me
 * Access: Authenticated
 */
exports.me = async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      username: req.user.username,
      full_name: req.user.fullName,
      role: req.user.role,
      branch_id: req.user.branchId,
      branch: req.user.branch,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user info' });
  }
};

/**
 * GET /api/auth/staff
 * Access: ADMIN, CASHIER
 */
exports.getStaff = async (req, res) => {
  try {
    const { branch_id } = req.query;
    let where = {};

    if (req.user.role !== 'admin') {
      // Non-admin can only see staff from their own branch
      where = eq(users.branchId, req.user.branchId);
    } else if (branch_id) {
      where = eq(users.branchId, parseInt(branch_id));
    }

    const staffList = await db.query.users.findMany({
      where,
      columns: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        branchId: true,
        active: true,
      },
    });

    // Map to expected format
    const mapped = staffList.map(u => ({
      id: u.id,
      username: u.username,
      full_name: u.fullName,
      role: u.role,
      branch_id: u.branchId,
      active: u.active,
    }));

    res.json(mapped);
  } catch (error) {
    console.error('getStaff error:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
};

/**
 * POST /api/auth/register
 * Access: ADMIN only
 */
exports.register = async (req, res) => {
  try {
    const { username, password, full_name, email, role, branch_id } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if username already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    if (existing) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db.insert(users).values({
      username,
      password: hashedPassword,
      fullName: full_name || null,
      email: email || null,
      role: role || 'staff',
      branchId: branch_id ? parseInt(branch_id) : null,
    }).returning();

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      full_name: newUser.fullName,
      role: newUser.role,
      branch_id: newUser.branchId,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};
