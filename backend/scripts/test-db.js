const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Testing DB connection...');
  try {
    const count = await prisma.theme.count();
    console.log('Successfully connected! Themes count:', count);
  } catch (e) {
    console.error('Database Connection Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
