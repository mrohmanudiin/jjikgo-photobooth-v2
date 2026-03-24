const { db } = require('../config/db');
const { packages, addons, cafeSnacks, promos, themes } = require('../db/schema');
const { eq } = require('drizzle-orm');

// Map model name strings to actual Drizzle table objects
const modelMap = {
  package: packages,
  addon: addons,
  cafeSnack: cafeSnacks,
  promo: promos,
  theme: themes,
};

const getAll = (modelName) => async (req, res) => {
  try {
    const table = modelMap[modelName];
    if (!table) return res.status(400).json({ error: `Unknown model: ${modelName}` });

    // Use branchFilter from branchScope middleware
    let query = db.select().from(table);
    if (req.branchFilter !== undefined && req.branchFilter !== null) {
      query = query.where(eq(table.branchId, req.branchFilter));
    }
    
    // Sort by label/name if possible
    const items = await query;
    res.json(items);
  } catch (error) {
    console.error(`getAll ${modelName} error:`, error);
    res.status(500).json({ error: error.message });
  }
};

const createItem = (modelName) => async (req, res) => {
  try {
    const table = modelMap[modelName];
    if (!table) return res.status(400).json({ error: `Unknown model: ${modelName}` });

    // Enforce branchId from req.branchFilter if provided as query param or from non-admin user
    const payload = { ...req.body };
    if (payload.branchId === 'ALL') payload.branchId = null;
    
    if (req.branchFilter && !payload.branchId) {
      payload.branchId = req.branchFilter;
    }

    const [item] = await db.insert(table).values(payload).returning();
    res.status(201).json(item);
  } catch (error) {
    console.error(`createItem ${modelName} error:`, error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/studio/:model/:id
 * Access: ADMIN
 */
const updateItem = (modelName) => async (req, res) => {
  try {
    const table = modelMap[modelName];
    if (!table) return res.status(400).json({ error: `Unknown model: ${modelName}` });

    const payload = { ...req.body };
    if (payload.branchId === 'ALL') payload.branchId = null;

    const { id } = req.params;
    const [item] = await db.update(table)
      .set(payload)
      .where(eq(table.id, parseInt(id)))
      .returning();

    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    console.error(`updateItem ${modelName} error:`, error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/studio/:model/:id
 * Access: ADMIN
 */
const deleteItem = (modelName) => async (req, res) => {
  const { id } = req.params;
  console.log(`[DELETE] Model: ${modelName}, ID: ${id}`);
  try {
    const table = modelMap[modelName];
    if (!table) return res.status(400).json({ error: `Unknown model: ${modelName}` });

    await db.delete(table).where(eq(table.id, parseInt(id)));
    console.log(`[DELETE] Success for model ${modelName}, ID ${id}`);
    res.status(204).send();
  } catch (error) {
    console.error(`[DELETE] Error for model ${modelName}, ID ${id}:`, error.message);
    // Postgres foreign key constraint
    if (error.code === '23503') {
      return res.status(409).json({
        error: `This ${modelName} cannot be removed because it's currently in use. Try disabling it instead.`,
      });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAll,
  createItem,
  updateItem,
  deleteItem,
};
