require('dotenv').config();
const mysql = require("mysql2/promise");
const fs = require("fs");


const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

// Load JSON file
const rawData = fs.readFileSync("merged_supermarket_data.json");
console.log("Raw data", JSON.parse(rawData));
const products = JSON.parse(rawData);

// Function to insert data into the database
async function populateDatabase() {
    console.log("DB Config:", dbConfig);
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log("Connected to database");

        // Insert categories
        // const categories = [...new Set(products.map(p => p.category))];
        // for (let category of categories) {
        //     await connection.execute("INSERT IGNORE INTO Category (category_name) VALUES (?)", [category]);
        // }

        // Insert supermarkets
        const supermarkets = new Set();
        products.forEach(product => {
            Object.keys(product.prices).forEach(supermarket => {
                supermarkets.add(supermarket);
            });
        });

        for (let supermarket of supermarkets) {
            await connection.execute("INSERT IGNORE INTO Supermarket (supermarket_name, address) VALUES (?, ?)", [supermarket, "Unknown"]);
        }

        // Insert products
        for (let product of products) {
            for (let [supermarket, details] of Object.entries(product.prices)) {
                await connection.execute(
                    "INSERT INTO Product (category_name, name, price, image_url, supermarket_name) VALUES (?, ?, ?, ?, ?)",
                    [product.category, product.name, details.price, product.image_url, supermarket]
                );
            }
        }

        console.log("Database populated successfully!");
    } catch (error) {
        console.error("Error populating database:", error);
    } finally {
        await connection.end();
    }
}

// ✅ Export function instead of calling it
module.exports = populateDatabase;
