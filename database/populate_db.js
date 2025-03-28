const mysql = require("mysql2/promise");
const fs = require("fs");

// Database connection details
const dbConfig = {
    host: "localhost",
    user: "root", // Change if needed
    password: "BudgetBuddy", // Change if you set a password
    database: "BudgetBuddy",
};

// Load JSON file
const rawData = fs.readFileSync("merged_supermarket_data.json");
const products = JSON.parse(rawData);

// Function to insert data into the database
async function populateDatabase() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log("Connected to database");

        // Insert categories
        const categories = [...new Set(products.map(p => p.category))];
        for (let category of categories) {
            await connection.execute("INSERT IGNORE INTO Category (category_name) VALUES (?)", [category]);
        }

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

populateDatabase();
