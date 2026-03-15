require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { branches, users, themes, packages, addons, booths, settings } = require('./schema');
const bcrypt = require('bcryptjs');
const { eq } = require('drizzle-orm');

async function seed() {
  const queryClient = postgres(process.env.DATABASE_URL);
  const db = drizzle(queryClient);

  console.log('🌱 Seeding database...');

  // ── 1. Create default branch ──────────────────────────
  let [branch] = await db.select().from(branches).where(eq(branches.id, 1));
  if (!branch) {
    [branch] = await db.insert(branches).values({
      name: 'Main Branch',
      location: 'Default Location',
    }).returning();
    console.log('✅ Default branch created:', branch.name);
  } else {
    console.log('⏭️  Default branch already exists:', branch.name);
  }

  // ── 2. Create admin user ─────────────────────────────
  let [admin] = await db.select().from(users).where(eq(users.username, 'admin'));
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    [admin] = await db.insert(users).values({
      username: 'admin',
      password: hashedPassword,
      fullName: 'System Admin',
      role: 'admin',
      branchId: null, // Admin is not branch-scoped
    }).returning();
    console.log('✅ Admin user created:', admin.username);
  } else {
    console.log('⏭️  Admin user already exists');
  }

  // ── 3. Create demo cashier ────────────────────────────
  let [cashier] = await db.select().from(users).where(eq(users.username, 'cashier1'));
  if (!cashier) {
    const hashedPassword = await bcrypt.hash('cashier123', 12);
    [cashier] = await db.insert(users).values({
      username: 'cashier1',
      password: hashedPassword,
      fullName: 'Cashier Main Branch',
      role: 'cashier',
      branchId: branch.id,
    }).returning();
    console.log('✅ Cashier user created:', cashier.username);
  }

  // ── 4. Create demo staff ─────────────────────────────
  let [staff] = await db.select().from(users).where(eq(users.username, 'staff1'));
  if (!staff) {
    const hashedPassword = await bcrypt.hash('staff123', 12);
    [staff] = await db.insert(users).values({
      username: 'staff1',
      password: hashedPassword,
      fullName: 'Staff Main Branch',
      role: 'staff',
      branchId: branch.id,
    }).returning();
    console.log('✅ Staff user created:', staff.username);
  }

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('Demo Credentials:');
  console.log('  Admin:   admin / admin123          (all branches)');
  console.log('  Cashier: cashier1 / cashier123     (Main Branch)');
  console.log('  Staff:   staff1 / staff123         (Main Branch)');

  await queryClient.end();
}

seed().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
