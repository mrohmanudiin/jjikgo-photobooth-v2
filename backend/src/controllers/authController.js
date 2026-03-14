const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
      include: { branch: true }
    });

    if (!user || user.password !== password) { // In a real app, use bcrypt!
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Return user info and branch info
    res.json({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      branch_id: user.branch_id,
      branch: user.branch
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const { branch_id } = req.query;
    const users = await prisma.user.findMany({
      where: branch_id ? { branch_id: parseInt(branch_id) } : {},
      select: {
        id: true,
        username: true,
        full_name: true,
        role: true,
        branch_id: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
};
