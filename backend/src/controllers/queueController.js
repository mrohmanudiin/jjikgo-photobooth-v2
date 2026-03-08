const prisma = require('../config/prisma');

exports.getQueue = async (req, res) => {
    try {
        const queues = await prisma.queue.findMany({
            where: {
                status: {
                    in: ['waiting', 'called', 'in_progress']
                }
            },
            include: {
                theme: true,
                transaction: true
            },
            orderBy: { created_at: 'asc' }
        });

        const groupedQueue = queues.reduce((acc, queue) => {
            const themeName = queue.theme.name;
            if (!acc[themeName]) acc[themeName] = [];
            acc[themeName].push(queue);
            return acc;
        }, {});

        res.json(groupedQueue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch queue' });
    }
};

exports.callNextQueue = async (req, res) => {
    try {
        const { theme_id } = req.body;

        const nextQueue = await prisma.queue.findFirst({
            where: { theme_id: parseInt(theme_id), status: 'waiting' },
            orderBy: { created_at: 'asc' }
        });

        if (!nextQueue) {
            return res.status(404).json({ message: 'No waiting queue found for this theme' });
        }

        const updatedQueue = await prisma.queue.update({
            where: { id: nextQueue.id },
            data: { status: 'called' },
            include: { transaction: true }
        });

        const io = req.app.get('io');
        io.emit('queueUpdated', { theme_id: parseInt(theme_id), action: 'queue_called', queue: updatedQueue });

        res.json(updatedQueue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to call next queue' });
    }
};

exports.startSession = async (req, res) => {
    try {
        const { queue_id, booth_id } = req.body;

        const updatedQueue = await prisma.queue.update({
            where: { id: parseInt(queue_id) },
            data: { status: 'in_progress' }
        });

        await prisma.transaction.update({
            where: { id: updatedQueue.transaction_id },
            data: { status: 'shooting' }
        });

        if (booth_id) {
            await prisma.booth.update({
                where: { id: parseInt(booth_id) },
                data: { status: 'busy' }
            });
        }

        const io = req.app.get('io');
        io.emit('queueUpdated', { theme_id: updatedQueue.theme_id, action: 'session_started', queue: updatedQueue });

        res.json(updatedQueue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to start session' });
    }
};

exports.finishSession = async (req, res) => {
    try {
        const { queue_id, booth_id } = req.body;

        const updatedQueue = await prisma.queue.update({
            where: { id: parseInt(queue_id) },
            data: { status: 'finished' }
        });

        await prisma.transaction.update({
            where: { id: updatedQueue.transaction_id },
            data: { status: 'finished' }
        });

        if (booth_id) {
            await prisma.booth.update({
                where: { id: parseInt(booth_id) },
                data: { status: 'available' }
            });
        }

        const io = req.app.get('io');
        io.emit('queueUpdated', { theme_id: updatedQueue.theme_id, action: 'session_finished', queue: updatedQueue });

        res.json(updatedQueue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to finish session' });
    }
};
