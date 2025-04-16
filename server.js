require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');


const populateDatabase = require(path.join(__dirname, 'database', 'populate_db.js'));

populateDatabase()
    .then(() => console.log("Database populated successfully!"))
    .catch(err => console.error("Error populating database:", err));

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'web')));

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};


// Fetch all products
app.get('/products', async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    const [products] = await connection.execute("select * from Product inner join Price on Product.product_id = Price.product_id");
    await connection.end();
    console.log("Products fetched:", products.length);
    res.json(products);
});

// Fetch product details with prices
app.get('*/products/:name', async (req, res) => {
    const { name } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute("select * from Product inner join Price on Product.product_id = Price.product_id where product_name = ?", [name]);
    if (rows.length === 0) return res.status(404).json({ error: "Product not found" });
    await connection.end();
    console.log("Product details fetched:", rows.length);

    //Restructure product data to match the expected format
    const productData = {
        name: rows[0].product_name,
        image_url: rows[0].image_url,
        prices: {}
    };

    rows.forEach(row => {
        productData.prices[row.supermarket_name] = {
            price: row.price,
            // add link here if you want it
        };
    });
    res.json({productData});
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
