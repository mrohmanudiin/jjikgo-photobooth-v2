const { db } = require('../config/db');
const { settings } = require('../db/schema');
const { eq, and } = require('drizzle-orm');

/**
 * GET /api/studio/settings
 * Access: ADMIN, CASHIER (branch-scoped)
 */
const getSettings = async (req, res) => {
  try {
    let where;
    if (req.branchFilter) {
      // Get settings for the specific branch + global settings (null branch)
      const result = await db.select().from(settings);
      const filtered = result.filter(s => !s.branchId || s.branchId === req.branchFilter);
      const settingsMap = filtered.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
      return res.json(settingsMap);
    }

    const result = await db.select().from(settings);
    const settingsMap = result.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsMap);
  } catch (error) {
    console.error('getSettings error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/studio/settings
 * Access: ADMIN
 */
const updateSetting = async (req, res) => {
  const { key, value, branch_id } = req.body;
  try {
    const branchId = branch_id ? parseInt(branch_id) : null;

    // Try to find existing setting
    const existing = await db.query.settings.findFirst({
      where: and(
        eq(settings.key, key),
        branchId ? eq(settings.branchId, branchId) : undefined
      ),
    });

    let result;
    if (existing) {
      [result] = await db.update(settings)
        .set({ value: String(value) })
        .where(eq(settings.id, existing.id))
        .returning();
    } else {
      [result] = await db.insert(settings).values({
        key,
        value: String(value),
        branchId,
      }).returning();
    }

    res.json(result);
  } catch (error) {
    console.error('updateSetting error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSettings,
  updateSetting,
};
