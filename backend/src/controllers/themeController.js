const { db } = require('../config/db');
const { themes } = require('../db/schema');
const { eq } = require('drizzle-orm');

/**
 * GET /api/themes
 * Access: ALL authenticated
 */
exports.getThemes = async (req, res) => {
  try {
    let where = eq(themes.active, true);

    // Branch filter — if non-admin, only show themes for their branch
    if (req.branchFilter) {
      const result = await db.query.themes.findMany({
        where: eq(themes.active, true),
      });
      // Filter by branch (themes can be global or branch-specific)
      const filtered = result.filter(t => !t.branchId || t.branchId === req.branchFilter);
      return res.json(filtered);
    }

    const result = await db.query.themes.findMany({
      where: eq(themes.active, true),
    });
    res.json(result);
  } catch (error) {
    console.error('getThemes error:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
};
