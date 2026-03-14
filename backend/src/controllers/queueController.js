const prisma = require('../config/prisma');

exports.getQueue = async (req, res) => {
    try {
        const queues = await prisma.queue.findMany({
            where: {
                status: {
                    in: ['waiting', 'called', 'in_session', 'print_requested', 'printing']
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
            include: { transaction: true, theme: true }
        });

        await prisma.transaction.update({
            where: { id: updatedQueue.transaction_id },
            data: { status: 'called' }
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
            data: { 
                status: 'in_session',
                booth_id: booth_id ? parseInt(booth_id) : undefined
            },
            include: { theme: true, booth: true }
        });

        await prisma.transaction.update({
            where: { id: updatedQueue.transaction_id },
            data: { status: 'in_session' }
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
            data: { status: 'done' },
            include: { theme: true, booth: true }
        });

        await prisma.transaction.update({
            where: { id: updatedQueue.transaction_id },
            data: { status: 'done' }
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

exports.sendToPrint = async (req, res) => {
    try {
        const { queue_id } = req.body;

        const updatedQueue = await prisma.queue.update({
            where: { id: parseInt(queue_id) },
            data: { status: 'print_requested' },
            include: { transaction: true, theme: true }
        });

        await prisma.transaction.update({
            where: { id: updatedQueue.transaction_id },
            data: { status: 'print_requested' }
        });

        const io = req.app.get('io');
        io.emit('queueUpdated', { theme_id: updatedQueue.theme_id, action: 'print_requested', queue: updatedQueue });
        io.emit('printRequested', { queue: updatedQueue });

        res.json(updatedQueue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send print request' });
    }
};

exports.trackQueue = async (req, res) => {
    try {
        const { queueNumber } = req.params;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const recentQueues = await prisma.queue.findMany({
            where: {
                created_at: { gte: today }
            },
            include: {
                theme: true,
                transaction: true
            },
            orderBy: { created_at: 'desc' }
        });

        const targetQueue = recentQueues.find(q => {
            const formatted = `${q.theme?.prefix || 'T'}${String(q.queue_number).padStart(2, '0')}`;
            return formatted.toUpperCase() === queueNumber.toUpperCase();
        });

        if (!targetQueue) {
            return res.status(404).json({ error: 'Queue not found for today.' });
        }

        const peopleAhead = await prisma.queue.count({
            where: {
                theme_id: targetQueue.theme_id,
                status: 'waiting',
                created_at: { lt: targetQueue.created_at }
            }
        });

        res.json({
            queueNumber: queueNumber.toUpperCase(),
            customerName: targetQueue.transaction.customer_name,
            theme: targetQueue.theme.name,
            people: targetQueue.transaction.people_count,
            status: targetQueue.status.toLowerCase() === 'waiting_shoot' ? 'waiting' : targetQueue.status.toLowerCase(),
            peopleAhead: targetQueue.status.toLowerCase() === 'waiting' || targetQueue.status.toLowerCase() === 'waiting_shoot' ? peopleAhead : 0,
            booth: `${targetQueue.theme.name} Booth`
        });

    } catch (error) {
        console.error("Error tracking queue:", error);
        res.status(500).json({ error: 'Failed to track queue' });
    }
};
