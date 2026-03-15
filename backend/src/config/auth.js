const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { db } = require('./db');
const { users, authSessions } = require('../db/schema');
const { eq, and, gt } = require('drizzle-orm');
const env = require('./env');

/**
 * Hash a password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

/**
 * Compare a password with a hash
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Create a session for a user
 */
async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const id = crypto.randomUUID();

  await db.insert(authSessions).values({
    id,
    userId,
    token,
    expiresAt,
  });

  return { id, token, expiresAt };
}

/**
 * Validate a session token
 */
async function validateSession(token) {
  if (!token) return null;

  const result = await db.query.authSessions.findFirst({
    where: and(
      eq(authSessions.token, token),
      gt(authSessions.expiresAt, new Date())
    ),
    with: {
      user: {
        with: {
          branch: true,
        },
      },
    },
  });

  if (!result) return null;

  return result.user;
}

/**
 * Delete a session
 */
async function deleteSession(token) {
  await db.delete(authSessions).where(eq(authSessions.token, token));
}

module.exports = {
  hashPassword,
  comparePassword,
  createSession,
  validateSession,
  deleteSession,
};
