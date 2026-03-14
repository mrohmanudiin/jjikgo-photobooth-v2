const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getBranches = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        _count: {
          select: { users: true, transactions: true }
        }
      }
    });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

exports.createBranch = async (req, res) => {
  try {
    const { name, location } = req.body;
    const branch = await prisma.branch.create({
      data: { name, location }
    });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create branch' });
  }
};

exports.getBranchStats = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await prisma.$transaction([
      prisma.transaction.count({ where: { branch_id: parseInt(id) } }),
      prisma.transaction.aggregate({
        where: { branch_id: parseInt(id) },
        _sum: { total_price: true }
      }),
      prisma.shift.count({ where: { branch_id: parseInt(id) } })
    ]);

    res.json({
      transactionCount: stats[0],
      totalRevenue: stats[1]._sum.total_price || 0,
      shiftCount: stats[2]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch branch stats' });
  }
};
