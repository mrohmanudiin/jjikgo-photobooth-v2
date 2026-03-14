const prisma = require('../config/prisma');

exports.getAllTransactions = async (req, res) => {
    try {
        const { branch_id } = req.query;
        const where = branch_id ? { branch_id: parseInt(branch_id) } : {};

        const transactions = await prisma.transaction.findMany({
            where,
            include: { queue: { include: { theme: true } }, theme: true },
            orderBy: { created_at: 'desc' }
        });

        let allSessions = [];
        for (const tx of transactions) {
            for (const q of tx.queue) {
                allSessions.push({
                    id: String(q.id),
                    session_id: String(q.id),
                    order_id: tx.invoice_number,
                    queue_number: `${q.theme?.prefix || 'T'}${String(q.queue_number).padStart(2, '0')}`,
                    customer_name: tx.customer_name,
                    people_count: tx.people_count,
                    package: tx.package_name,
                    theme: q.theme?.name || tx.theme?.name || '—',
                    theme_id: q.theme_id,
                    addons: tx.addons || [],
                    cafe_snacks: tx.cafe_snacks || [],
                    promo: tx.promo,
                    note: tx.note,
                    base_price: tx.total_price,
                    discount: 0, 
                    total: tx.total_price / (tx.queue.length || 1),
                    payment_method: tx.payment_method,
                    payment_status: 'PAID',
                    order_status: q.status,
                    created_at: tx.created_at,
                    branch_id: tx.branch_id,
                    shift_id: tx.shift_id,
                    user_id: tx.user_id
                });
            }
        }
        res.json(allSessions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

exports.createTransaction = async (req, res) => {
    try {
        const { sessions, branch_id, shift_id, user_id } = req.body;
        if (!sessions || sessions.length === 0) return res.status(400).json({ error: 'No sessions provided' });

        const createdSessions = [];
        const mainSession = sessions[0];
        const invoiceNumber = `JJ-${Date.now()}`;

        const transaction = await prisma.transaction.create({
            data: {
                invoice_number: invoiceNumber,
                branch_id: parseInt(branch_id),
                shift_id: shift_id ? parseInt(shift_id) : null,
                user_id: user_id ? parseInt(user_id) : null,
                customer_name: mainSession.customer_name || 'Walkin',
                customer_email: '',
                people_count: parseInt(mainSession.people_count) || 1,
                theme_id: mainSession.theme_id === 'cafe' ? 1 : parseInt(mainSession.theme_id) || 1,
                package_name: mainSession.package || '',
                addons: mainSession.addons || [],
                cafe_snacks: mainSession.cafe_snacks || [],
                promo: mainSession.promo || null,
                note: mainSession.note || null,
                payment_method: mainSession.payment_method || 'Cash',
                total_price: parseFloat(mainSession.total) || 0,
                status: 'waiting',
            }
        });

        for (const s of sessions) {
            const tId = s.theme_id === 'cafe' ? 1 : parseInt(s.theme_id);
            const qNum = parseInt((s.queue_number || '').replace(/\D/g, '')) || 1;

            const q = await prisma.queue.create({
                data: {
                    transaction_id: transaction.id,
                    theme_id: tId,
                    queue_number: qNum,
                    status: s.order_status || 'waiting',
                }
            });

            createdSessions.push({ ...s, id: String(q.id), session_id: String(q.id), order_id: invoiceNumber });
        }

        const io = req.app.get('io');
        io.emit('queueUpdated', { action: 'new_transactions', branch_id });

        res.status(201).json({ success: true, all_sessions: createdSessions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params; // this is queue_id
        const { status } = req.body;

        const updatedQueue = await prisma.queue.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        await prisma.transaction.update({
            where: { id: updatedQueue.transaction_id },
            data: { status }
        });

        const io = req.app.get('io');
        io.emit('queueUpdated', { action: 'status_updated' });

        res.json(updatedQueue);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
