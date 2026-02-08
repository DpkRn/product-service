const express = require('express');
const { Client } = require('pg');
const logger = require('./logger');

const app = express();
app.use(express.json());

/* ---------------- REQUEST LOGGING MIDDLEWARE ---------------- */

app.use((req, res, next) => {
  const start = Date.now();

  logger.logRequest('REQ_001', `Incoming ${req.method} request`, 'pending', {
    url: req.url,
    body: req.body
  });

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.logRequest('REQ_002', `${req.method} request completed`, res.statusCode, {
      url: req.url,
      duration_ms: duration
    });
  });

  next();
});

/* ---------------- DATABASE CONFIG ---------------- */

const client = new Client({
  host: process.env.DB_HOST || 'postgres',
  user: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASSWORD || 'mypassword',
  database: process.env.DB_NAME || 'mydb'
});

client.connect()
  .then(() => logger.logSuccess('DB_001', 'Connected to PostgreSQL', 200))
  .catch(err => logger.logError('DB_002', 'PostgreSQL connection failed', 500, err));

/* ---------------- ROUTES ---------------- */

app.get('/', (req, res) => {
  logger.logSuccess('HEALTH_001', 'Health check passed', 200, {
    message: 'product-service is working fine'
  });
  res.json({
    success: true,
    message: "product-service is working fine"
  });
});

app.get('/products', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM products');
    logger.logSuccess('PROD_001', 'Products fetched successfully', 200, { count: result.rows.length });
    res.json(result.rows);
  } catch (err) {
    logger.logError('PROD_002', 'Failed to fetch products', 500, err);
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- GLOBAL ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  logger.logError('ERR_001', 'Unhandled application error', 500, err);
  res.status(500).json({ code: 'ERR_001', msg: 'Internal Server Error', status: 500 });
});

/* ---------------- SERVER START ---------------- */

app.listen(5001, '0.0.0.0', () => {
  logger.info('Product service running on port 5001');
});
