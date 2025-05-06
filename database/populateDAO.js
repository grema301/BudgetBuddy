const sql  = require('./dbConnection');

async function insertSupermarket(name) {
    await sql`INSERT INTO public."Supermarket"(supermarket_name)
                      VALUES (${name}) ON CONFLICT DO NOTHING`;
}

//Insert to Product and return product_id
// If the product already exists, return the existing product_id
async function insertProduct(name, imageUrl) {
    const result = await sql`
        INSERT INTO public."Product"(product_name, image_url)
        VALUES (${name}, ${imageUrl})
        ON CONFLICT (product_name) DO NOTHING
        RETURNING public."Product".product_id
    `;

    console.log(result.length);
    console.log(result + " result[0]");
    if (result.length > 0) return result[0].product_id;
   
    
    const existing = await sql`SELECT product_id FROM public."Product" WHERE product_name = ${name}`;
    console.log(existing[0].product_id + " existing[0].product_id\n\n\n");
    return existing[0].product_id;
}

async function insertPrice(productId, supermarket, price) {
    await sql`
        INSERT INTO public."Price" (product_id, supermarket_name, price)
        VALUES (${productId}, ${supermarket}, ${price})
        ON CONFLICT DO NOTHING
    `;
}

module.exports = { insertSupermarket, insertProduct, insertPrice };