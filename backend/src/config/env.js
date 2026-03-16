require('dotenv').config();

// Validate required env vars
// Note: 'ATABASE_URL' is included because the logs show a typo in the environment variable name
const dbUrl = process.env.DATABASE_URL || process.env.DB_URL || process.env.ATABASE_URL;

if (!dbUrl) {
  console.warn('⚠️  DATABASE_URL (or DB_URL) is missing! The app will likely fail on database queries.');
  console.log('Available Env Keys:', Object.keys(process.env).filter(k => k.toLowerCase().includes('database') || k.toLowerCase().includes('db') || k.includes('URL')));
}

const env = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: dbUrl,
  JWT_SECRET: process.env.JWT_SECRET || 'jjikgo-super-secret-key-change-in-production',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URLS: (process.env.FRONTEND_URLS || 'http://localhost:5173,http://localhost:5174,http://localhost:5175').split(','),
};

module.exports = env;
