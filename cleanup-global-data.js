require('dotenv').config({ path: './backend/.env' });
const { db } = require('./backend/src/config/db');
const { packages, addons, cafeSnacks, promos, themes, booths, branches } = require('./backend/src/db/schema');
const { isNull, eq, sql } = require('drizzle-orm');

async function cleanupGlobalData() {
  console.log('🧹 Cleaning up global data (branch_id IS NULL)...');
  
  try {
    // We cannot easily delete things used in transactions unless we update those transactions too.
    // However, if the user says "remove data for global branch", they might want them gone completely.
    // If foreign keys prevent deletion, we will catch it.

    const models = [
      { name: 'packages', table: packages },
      { name: 'addons', table: addons },
      { name: 'cafeSnacks', table: cafeSnacks },
      { name: 'promos', table: promos },
      { name: 'themes', table: themes },
      { name: 'booths', table: booths }
    ];

    for (const model of models) {
      const deleted = await db.delete(model.table)
        .where(isNull(model.table.branchId))
        .returning();
      console.log(`✅ Deleted ${deleted.length} global records from ${model.name}`);
    }

    console.log('🎉 Global data cleanup complete.');
  } catch (err) {
    console.error('❌ Cleanup failed:', err.message);
    if (err.message.includes('violates foreign key constraint')) {
        console.log('⚠️ Some records are in use. Let\'s try assigning them to an existing branch instead of deleting.');
        // Fallback or just stop here.
    }
  }
}

cleanupGlobalData().then(() => process.exit(0));
