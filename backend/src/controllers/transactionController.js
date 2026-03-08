const prisma = require('../config/prisma');

exports.createTransaction = async (req, res) => {
    try {
        const { customer_name, customer_email, theme_id, package_name, payment_method, total_price } = req.body;

        const lastQueue = await prisma.queue.findFirst({
            where: { theme_id: parseInt(theme_id) },
            orderBy: { created_at: 'desc' },
        });

        let nextQueueNum = 1;
        if (lastQueue && lastQueue.queue_number) {
            nextQueueNum = lastQueue.queue_number + 1;
        }

        const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const transaction = await prisma.transaction.create({
            data: {
                invoice_number: invoiceNumber,
                customer_name,
                customer_email,
                theme_id: parseInt(theme_id),
                package_name,
                payment_method,
                total_price: parseFloat(total_price),
                status: 'waiting',
            }
        });

        const queue = await prisma.queue.create({
            data: {
                transaction_id: transaction.id,
                theme_id: parseInt(theme_id),
                queue_number: nextQueueNum,
                status: 'waiting',
            }
        });

        const io = req.app.get('io');
        io.emit('queueUpdated', { theme_id: parseInt(theme_id), action: 'new_transaction' });

        res.status(201).json({ transaction, queue });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
};
