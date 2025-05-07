require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./api/product');
const userRoutes = require('./api/user');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const app = express();
app.use(cors());
app.use(express.json());

// Serve all static files from the 'web' directory
app.use(express.static(path.join(__dirname, 'web')));

//Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));  // Adjust the path to your HTML file
});
app.get("/index", (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));  // Adjust the path to your HTML file
});

// Route: Product page
app.get("/product/:name", (req, res) => {
    res.sendFile(path.join(__dirname, "web", "product.html"));
});

// Route: Register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'register.html'));
});

// Route: Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'login.html'));
});

app.use("/api/products", productRoutes);
app.use("/api/user", userRoutes);


app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'cart.html'));
});


app.get("*", (req, res) => {
    res.status(404).send("404 Not Found");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));