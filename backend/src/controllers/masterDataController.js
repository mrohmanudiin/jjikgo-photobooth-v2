const prisma = require('../config/prisma');

const getAll = (model) => async (req, res) => {
    try {
        const items = await prisma[model].findMany();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createItem = (model) => async (req, res) => {
    try {
        const item = await prisma[model].create({ data: req.body });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateItem = (model) => async (req, res) => {
    const { id } = req.params;
    try {
        const item = await prisma[model].update({
            where: { id: parseInt(id) },
            data: req.body,
        });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteItem = (model) => async (req, res) => {
    const { id } = req.params;
    console.log(`[DELETE] Model: ${model}, ID: ${id}`);
    try {
        await prisma[model].delete({
            where: { id: parseInt(id) },
        });
        console.log(`[DELETE] Success for model ${model}, ID ${id}`);
        res.status(204).send();
    } catch (error) {
        console.error(`[DELETE] Error for model ${model}, ID ${id}:`, error.message);
        // Prisma error for foreign key constraint: P2003
        if (error.code === 'P2003' || error.message.includes('Foreign key constraint')) {
            return res.status(409).json({
                error: `This ${model} cannot be removed because it's currently in use (e.g., in transactions or queues). Try disabling it instead.`
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
