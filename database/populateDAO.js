const sql  = require('./dbConnection');

async function insertSupermarket(name) {
    await sql`INSERT INTO public."Supermarket"(supermarket_name)
                      VALUES (${name}) ON CONFLICT DO NOTHING`;
}

//Insert to Product and return product_id
// If the product already exists, return the existing product_id
async function insertProduct(name, imageUrl, category) {
    const result = await sql`
        INSERT INTO public."Product"(product_name, image_url, category_name)
        VALUES (${name}, ${imageUrl}, ${category})
        ON CONFLICT (product_name) DO NOTHING
        RETURNING public."Product".product_id
    `;

    if (result.length > 0) return result[0].product_id;
   
    
    const existing = await sql`SELECT product_id FROM public."Product" WHERE product_name = ${name}`;
    return existing[0].product_id;
}

async function updateProductCategory(name, category) {
    const result = await sql`
        UPDATE public."Product" SET category_name = ${category}
        WHERE product_name = ${name}
        RETURNING*;
    `};

async function insertPrice(productId, supermarket, price) {
    await sql`
        INSERT INTO public."Price" (product_id, supermarket_name, price)
        VALUES (${productId}, ${supermarket}, ${price})
        ON CONFLICT DO NOTHING
    `;
}
async function addToCategory(name){
    const result = await sql`
    INSERT INTO public."category"(category_name)
    VALUES (${name})
    ON CONFLICT DO NOTHING
    RETURNING*;
`;
}

module.exports = { insertSupermarket, insertProduct, insertPrice, updateProductCategory, addToCategory };