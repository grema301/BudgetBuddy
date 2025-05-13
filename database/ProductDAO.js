
const sql  = require('./dbConnection');


// This module provides functions to interact with the Product and Price tables in the database.

async function getAllProducts() {
    const result  = await sql`
        SELECT * FROM public."Product"
        JOIN public."Price" ON public."Product".product_id = public."Price".product_id
    `;
    return result;
}

async function getProductByName(name) {
    // Use parameterized query to prevent SQL injection
    const result  = await sql`
        SELECT * FROM public."Product"
        JOIN public."Price" ON public."Product".product_id = public."Price".product_id
        WHERE product_name = ${name}
    `;
    return result;
}

module.exports = { getAllProducts, getProductByName };