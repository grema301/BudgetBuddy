require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./api/product');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const app = express();
app.use(cors());

// Serve all static files from the 'web' directory
app.use(express.static(path.join(__dirname, 'web')));

//Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));  // Adjust the path to your HTML file
});

// Route: Product page
app.get("/product/:name", (req, res) => {
    res.sendFile(path.join(__dirname, "web", "product.html"));
});

app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));