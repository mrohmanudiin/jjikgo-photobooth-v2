/**
 * Database migration script - creates auth_sessions table and adds missing columns
 * Run this to migrate from Prisma to Drizzle without losing data
 */
require('dotenv').config();
const postgres = require('postgres');

async function migrate() {
  const sql = postgres(process.env.DATABASE_URL);
  
  console.log('🔄 Running database migration...');

  try {
    // 1. Create auth_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES "User"(id),
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ auth_sessions table created');

    // 2. Add email column to User if it doesn't exist
    await sql`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS email TEXT
    `;
    console.log('✅ email column added to User');

    // 3. Add slug column to Package if it doesn't exist
    await sql`
      ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS slug TEXT
    `;
    // Set slugs for any packages that don't have one
    await sql`
      UPDATE "Package" SET slug = LOWER(REPLACE(label, ' ', '_')) WHERE slug IS NULL
    `;
    console.log('✅ slug column added to Package');

    // 4. Add unique constraint on slug if it doesn't exist
    const slugConstraint = await sql`
      SELECT constraint_name FROM information_schema.table_constraints 
      WHERE table_name = 'Package' AND constraint_name = 'Package_slug_unique'
    `;
    if (slugConstraint.length === 0) {
      try {
        await sql`ALTER TABLE "Package" ADD CONSTRAINT "Package_slug_unique" UNIQUE (slug)`;
        console.log('✅ Package slug unique constraint added');
      } catch (e) {
        console.log('⏭️  Package slug constraint skipped (duplicates may exist)');
      }
    }

    // 5. Add unique constraint on Setting (branch_id, key) if it doesn't exist 
    const settingConstraint = await sql`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'Setting' AND indexname = 'Setting_branch_id_key_key'
    `;
    if (settingConstraint.length === 0) {
      try {
        await sql`CREATE UNIQUE INDEX "Setting_branch_id_key_key" ON "Setting"(branch_id, key)`;
        console.log('✅ Setting (branch_id, key) unique index added');
      } catch (e) {
        console.log('⏭️  Setting index skipped:', e.message);
      }
    }

    console.log('');
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
  }

  await sql.end();
}

migrate();
