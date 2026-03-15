require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { branches } = require('./src/db/schema');

async function testCrud() {
  const queryClient = postgres(process.env.DATABASE_URL);
  const db = drizzle(queryClient);

  try {
    console.log('Testing create branch...');
    const [newBranch] = await db.insert(branches).values({
      name: 'Test Branch C',
      location: 'Test Loc',
    }).returning();
    console.log('Created:', newBranch);

    console.log('Testing read branch...');
    const all = await db.select().from(branches);
    console.log('Read total branches:', all.length);
  } catch (err) {
    console.error('Error during CRUD test:', err);
  }

  await queryClient.end();
}

testCrud();
