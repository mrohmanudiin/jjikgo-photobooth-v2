const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default branch
  const branch = await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Main Branch',
      location: 'Default Location',
    },
  });
  console.log('Default branch created:', branch.name);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'admin123', // In a real app, hash this!
      full_name: 'System Admin',
      role: 'admin',
      branch_id: branch.id,
    },
  });
  console.log('Admin user created:', admin.username);

  // Update existing data to associate with default branch
  await prisma.theme.updateMany({
    where: { branch_id: null },
    data: { branch_id: branch.id },
  });

  await prisma.transaction.updateMany({
    where: { branch_id: null },
    data: { branch_id: branch.id },
  });

  await prisma.booth.updateMany({
    where: { branch_id: null },
    data: { branch_id: branch.id },
  });

  await prisma.setting.updateMany({
    where: { branch_id: null },
    data: { branch_id: branch.id },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
