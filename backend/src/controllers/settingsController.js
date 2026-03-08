const prisma = require('../config/prisma');

const getSettings = async (req, res) => {
    try {
        const settings = await prisma.setting.findMany();
        const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateSetting = async (req, res) => {
    const { key, value } = req.body;
    try {
        const setting = await prisma.setting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
        });
        res.json(setting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getSettings,
    updateSetting,
};
