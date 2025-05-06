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
const products = JSON.parse(rawData);

// Function to insert data into the database
async function populateDatabase() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log("Connected to database");

        // Insert categories We need to implement this in the future *****
        // const categories = [...new Set(products.map(p => p.category))];
        // for (let category of categories) {
        //     await connection.execute("INSERT IGNORE INTO Category (category_name) VALUES (?)", [category]);
        // }

        //Insert supermarkets
        const supermarkets = new Set();
        products.forEach(product => { //get all the supermarkets from the products.
            Object.keys(product.prices).forEach(supermarket => {
                supermarkets.add(supermarket);
            });
        });
        for(const store of supermarkets){
            await connection.execute("INSERT IGNORE INTO supermarket (supermarket_name) VALUES (?)", [store]);
        }


        // Insert products and prices
        // Loop through products and insert them into the database
        for (const product of products) {
            // 1. Insert product (if not already in DB)
            const [productResult] = await connection.execute(
                "INSERT IGNORE INTO Product (product_name, image_url) VALUES (?, ?)",
                [product.name, product.image_url]
            );
        
            // 2. Get inserted product_id (auto-increment value)
            const productId = productResult.insertId;
        
            // 3. Loop through supermarkets for price info
            for (const [supermarketName, details] of Object.entries(product.prices)) {
                //console.log(supermarketName, details);
                // 4. Insert into Prices table
                await connection.execute(
                    `INSERT IGNORE INTO Price (product_id, supermarket_name, price)
                     VALUES (?, ?, ?)`,
                    [productId, supermarketName, details.price]
                );
            }
        }

    } catch (error) {
        console.error("Error populating database:", error);
    } finally {
        await connection.end();
    }
}

module.exports = populateDatabase;
