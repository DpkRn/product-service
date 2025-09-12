const express = require('express');
const { Client } = require('pg');

const app = express();
app.use(express.json());

const client = new Client({
    host: process.env.DB_HOST || 'postgres',
    user: process.env.DB_USER || 'myuser',
    password: process.env.DB_PASSWORD || 'mypassword',
    database: process.env.DB_NAME || 'mydb'
});

client.connect()
    .then(() => console.log('Backend2 connected to Postgres'))
    .catch(err => console.error('Backend2 DB Connection Error:', err));

app.get('/', (req, res) => {
     res.json({"sucess":true,"message":"yeah product-service is working fine"});
});

app.get('/products', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM products');  // Assume products table exists
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5001, () => {
    console.log('Backend 2 listening on port 5001');
});
