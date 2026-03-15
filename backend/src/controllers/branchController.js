const { db } = require('../config/db');
const { branches, transactions, users, shifts } = require('../db/schema');
const { eq, count, sum } = require('drizzle-orm');
const { emitToAdmin } = require('../socket');

/**
 * GET /api/branches
 * Access: ADMIN
 */
exports.getBranches = async (req, res) => {
  try {
    const allBranches = await db.query.branches.findMany({
      with: {
        users: { columns: { id: true } },
        transactions: { columns: { id: true } },
      },
      orderBy: (b, { asc }) => [asc(b.createdAt)],
    });

    const result = allBranches.map(b => ({
      ...b,
      _count: {
        users: b.users.length,
        transactions: b.transactions.length,
      },
      users: undefined,
      transactions: undefined,
    }));

    res.json(result);
  } catch (error) {
    console.error('getBranches error:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

/**
 * POST /api/branches
 * Access: ADMIN
 */
exports.createBranch = async (req, res) => {
  try {
    const { name, location } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Branch name is required' });
    }

    const [branch] = await db.insert(branches).values({
      name,
      location: location || null,
    }).returning();

    const io = req.app.get('io');
    emitToAdmin(io, 'branch_created', branch);

    res.status(201).json(branch);
  } catch (error) {
    console.error('createBranch error:', error);
    res.status(500).json({ error: 'Failed to create branch' });
  }
};

/**
 * PUT /api/branches/:id
 * Access: ADMIN
 */
exports.updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, active } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (active !== undefined) updateData.active = active;

    const [updated] = await db.update(branches)
      .set(updateData)
      .where(eq(branches.id, parseInt(id)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    const io = req.app.get('io');
    emitToAdmin(io, 'branch_updated', updated);

    res.json(updated);
  } catch (error) {
    console.error('updateBranch error:', error);
    res.status(500).json({ error: 'Failed to update branch' });
  }
};

/**
 * DELETE /api/branches/:id
 * Access: ADMIN
 */
exports.deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const branchId = parseInt(id);

    // Check if branch has users
    const [{ count: userCount }] = await db.select({ count: count() })
      .from(users)
      .where(eq(users.branchId, branchId));

    if (parseInt(userCount) > 0) {
      return res.status(400).json({ error: 'Cannot delete branch with existing users. Reassign or remove users first.' });
    }

    const [deleted] = await db.delete(branches)
      .where(eq(branches.id, branchId))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    const io = req.app.get('io');
    emitToAdmin(io, 'branch_deleted', { id: branchId });

    res.json({ success: true, id: branchId });
  } catch (error) {
    console.error('deleteBranch error:', error);
    res.status(500).json({ error: 'Failed to delete branch' });
  }
};

/**
 * GET /api/branches/:id/stats
 * Access: ADMIN
 */
exports.getBranchStats = async (req, res) => {
  try {
    const { id } = req.params;
    const branchId = parseInt(id);

    const [txCount] = await db.select({ count: count() })
      .from(transactions)
      .where(eq(transactions.branchId, branchId));

    const [txSum] = await db.select({ total: sum(transactions.totalPrice) })
      .from(transactions)
      .where(eq(transactions.branchId, branchId));

    const [shiftCount] = await db.select({ count: count() })
      .from(shifts)
      .where(eq(shifts.branchId, branchId));

    const [userCount] = await db.select({ count: count() })
      .from(users)
      .where(eq(users.branchId, branchId));

    res.json({
      transactionCount: parseInt(txCount?.count) || 0,
      totalRevenue: parseFloat(txSum?.total) || 0,
      shiftCount: parseInt(shiftCount?.count) || 0,
      userCount: parseInt(userCount?.count) || 0,
    });
  } catch (error) {
    console.error('getBranchStats error:', error);
    res.status(500).json({ error: 'Failed to fetch branch stats' });
  }
};
