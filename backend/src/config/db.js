const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const env = require('./env');
const schema = require('../db/schema');

let queryClient;
let db;

if (env.DATABASE_URL) {
  queryClient = postgres(env.DATABASE_URL);
  db = drizzle(queryClient, { schema });
} else {
  console.error('❌ Cannot initialize Database: DATABASE_URL is missing.');
  // Provide a proxy or similar if needed, but for now we'll just let it fail on use
  db = { 
    query: new Proxy({}, { get: () => { throw new Error('Database not initialized'); } }),
    insert: () => { throw new Error('Database not initialized'); },
    select: () => { throw new Error('Database not initialized'); }
  };
}

module.exports = { db, queryClient };
