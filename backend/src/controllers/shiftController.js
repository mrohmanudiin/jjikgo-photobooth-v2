const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.startShift = async (req, res) => {
  try {
    const { branch_id, user_id, starting_cash } = req.body;

    // Check if there is already an open shift for this branch/user
    const openShift = await prisma.shift.findFirst({
      where: {
        branch_id: parseInt(branch_id),
        status: 'open',
      },
    });

    if (openShift) {
      return res.status(400).json({ error: 'There is already an open shift for this branch.' });
    }

    const shift = await prisma.shift.create({
      data: {
        branch_id: parseInt(branch_id),
        user_id: parseInt(user_id),
        starting_cash: parseFloat(starting_cash),
        status: 'open',
      },
      include: {
        user: {
          select: { full_name: true, username: true }
        }
      }
    });

    res.json(shift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start shift' });
  }
};

exports.endShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { ending_cash } = req.body;

    const shift = await prisma.shift.update({
      where: { id: parseInt(id) },
      data: {
        end_time: new Date(),
        ending_cash: parseFloat(ending_cash),
        status: 'closed',
      },
    });

    res.json(shift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to end shift' });
  }
};

exports.getCurrentShift = async (req, res) => {
  try {
    const { branch_id } = req.query;
    const shift = await prisma.shift.findFirst({
      where: {
        branch_id: parseInt(branch_id),
        status: 'open',
      },
      include: {
        user: {
          select: { full_name: true, username: true }
        },
        expenses: true,
      }
    });

    res.json(shift);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get current shift' });
  }
};

exports.addExpense = async (req, res) => {
  try {
    const { shift_id, amount, description } = req.body;

    const expense = await prisma.expense.create({
      data: {
        shift_id: parseInt(shift_id),
        amount: parseFloat(amount),
        description: description,
      },
    });

    // Update total expenses in shift
    await prisma.shift.update({
      where: { id: parseInt(shift_id) },
      data: {
        total_expenses: {
          increment: parseFloat(amount)
        }
      }
    });

    res.json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
};
