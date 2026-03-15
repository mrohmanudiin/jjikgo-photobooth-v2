const { db } = require('../config/db');
const { users } = require('../db/schema');
const { hashPassword } = require('../config/auth');
const { eq, ne } = require('drizzle-orm');
const { emitToAdmin } = require('../socket');

/**
 * GET /api/users
 * Access: ADMIN
 */
exports.getUsers = async (req, res) => {
  try {
    const { branch_id } = req.query;

    const allUsers = await db.query.users.findMany({
      where: branch_id ? eq(users.branchId, parseInt(branch_id)) : undefined,
      with: { branch: { columns: { id: true, name: true } } },
      orderBy: (u, { asc }) => [asc(u.createdAt)],
    });

    const result = allUsers.map(u => ({
      id: u.id,
      username: u.username,
      full_name: u.fullName,
      email: u.email,
      role: u.role,
      branch_id: u.branchId,
      branch: u.branch,
      active: u.active,
      created_at: u.createdAt,
    }));

    res.json(result);
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * POST /api/users
 * Access: ADMIN
 */
exports.createUser = async (req, res) => {
  try {
    const { username, password, full_name, email, role, branch_id } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

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

    const userData = {
      id: newUser.id,
      username: newUser.username,
      full_name: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      branch_id: newUser.branchId,
      active: newUser.active,
    };

    const io = req.app.get('io');
    emitToAdmin(io, 'user_created', userData);

    res.status(201).json(userData);
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

/**
 * PUT /api/users/:id
 * Access: ADMIN
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, full_name, email, role, branch_id, active } = req.body;

    // Check username uniqueness if changing
    if (username) {
      const existing = await db.query.users.findFirst({
        where: eq(users.username, username),
      });
      if (existing && existing.id !== parseInt(id)) {
        return res.status(409).json({ error: 'Username already exists' });
      }
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (full_name !== undefined) updateData.fullName = full_name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (branch_id !== undefined) updateData.branchId = branch_id ? parseInt(branch_id) : null;
    if (active !== undefined) updateData.active = active;
    if (password) {
      updateData.password = await hashPassword(password);
    }

    const [updated] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = {
      id: updated.id,
      username: updated.username,
      full_name: updated.fullName,
      email: updated.email,
      role: updated.role,
      branch_id: updated.branchId,
      active: updated.active,
    };

    const io = req.app.get('io');
    emitToAdmin(io, 'user_updated', userData);

    res.json(userData);
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

/**
 * DELETE /api/users/:id
 * Access: ADMIN
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Prevent deleting yourself
    if (req.user?.id === userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const [deleted] = await db.delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    const io = req.app.get('io');
    emitToAdmin(io, 'user_deleted', { id: userId });

    res.json({ success: true, id: userId });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
