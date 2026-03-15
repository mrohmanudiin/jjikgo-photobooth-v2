require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

async function resetDb() {
  const queryClient = postgres(process.env.DATABASE_URL);
  
  console.log('Dropping all tables...');
  await queryClient`DROP SCHEMA public CASCADE;`;
  await queryClient`CREATE SCHEMA public;`;
  
  console.log('Done.');
  await queryClient.end();
}

resetDb().catch(console.error);
