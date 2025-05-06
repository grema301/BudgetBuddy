require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/product');
const path = require('path');

const app = express();
app.use(cors());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));  // Adjust the path to your HTML file
});

app.get("/styles.css", (req, res) =>{
    res.sendFile(path.join(__dirname, 'web', 'styles.css'));  // Adjust the path to your CSS file
});
app.get("/script.js", (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'script.js'));  // Adjust the path to your JS file
});

app.get("/product.html", (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'product.html'));  // Adjust the path to your HTML file
});
app.get("/product.js", (req, res) =>{
    res.sendFile(path.join(__dirname, 'web', 'product.js'));  // Adjust the path to your JS file
});

app.use("/products", productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));