const prisma = require('../config/prisma');

exports.getThemes = async (req, res) => {
    try {
        const themes = await prisma.theme.findMany({
            where: { active: true },
        });
        res.json(themes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch themes' });
    }
};
