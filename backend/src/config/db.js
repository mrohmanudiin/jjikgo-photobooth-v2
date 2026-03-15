const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const env = require('./env');
const schema = require('../db/schema');

const queryClient = postgres(env.DATABASE_URL);
const db = drizzle(queryClient, { schema });

module.exports = { db, queryClient };
