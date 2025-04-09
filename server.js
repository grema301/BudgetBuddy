require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const populateDB = require(path.join(__dirname, 'database', 'populate_db.js'));
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'web')));

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'anotherNewPassword', 
    database: 'BudgetBuddy'
};

// Fetch all products
app.get('/products', async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    const [products] = await connection.execute("SELECT * FROM products");
    await connection.end();
    res.json(products);
});

// Fetch product details with prices
app.get('/products/:name', async (req, res) => {
    const { name } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    const [product] = await connection.execute("SELECT * FROM products WHERE name = ?", [name]);
    if (product.length === 0) return res.status(404).json({ error: "Product not found" });

    const [prices] = await connection.execute(`
        SELECT stores.name as store, prices.price, prices.link 
        FROM prices 
        JOIN stores ON prices.store_id = stores.id 
        WHERE prices.product_id = ?
    `, [product[0].id]);

    await connection.end();

    res.json({ ...product[0], prices });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
