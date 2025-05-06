const fs = require("fs");
const {
    insertSupermarket,
    insertProduct,
    insertPrice
} = require("../database/populateDAO");

const rawData = fs.readFileSync("cleaned_supermarket_data.json", "utf8");
const products = JSON.parse(rawData);

async function populate() {
    for (const product of products) {
        const supermarkets = Object.keys(product.prices);
        for (const name of supermarkets) {
            await insertSupermarket(name);
        }

        const productId = await insertProduct(product.name, product.image_url);

        for (const [store, details] of Object.entries(product.prices)) {
            await insertPrice(productId, store, details.price);
        }
    }

    console.log("✅ Population complete");
}

populate().catch(console.error);