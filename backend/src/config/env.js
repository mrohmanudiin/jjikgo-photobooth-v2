require('dotenv').config();

const env = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'jjikgo-super-secret-key-change-in-production',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URLS: (process.env.FRONTEND_URLS || 'http://localhost:5173,http://localhost:5174,http://localhost:5175').split(','),
};

// Validate required env vars
if (!env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is required');
  process.exit(1);
}

module.exports = env;
