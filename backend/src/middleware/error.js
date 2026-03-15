const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Drizzle / Postgres errors
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with this value already exists.' });
  }
  if (err.code === '23503') {
    return res.status(409).json({ error: 'Cannot delete — this record is referenced by other data. Try disabling it instead.' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({ error: message });
};

module.exports = { errorHandler };
