const fs = require("fs");

// Load and parse the original JSON
const rawData = fs.readFileSync("merged_supermarket_data.json", "utf8");
const products = JSON.parse(rawData);

// Clean the prices
for (const product of products) {
    for (const [supermarket, details] of Object.entries(product.prices)) {
        let rawPrice = details.price;

        // Fix malformed price like "2..9"
        if (typeof rawPrice === "string") {
            rawPrice = rawPrice.replace(/[^\d.]/g, ""); // Remove non-numeric characters
        }

        try {
            const parsed = parseFloat(rawPrice);
            if (!isNaN(parsed)) {
                // Round to 2 decimal places
                product.prices[supermarket].price = Math.round(parsed * 100) / 100;
            } else {
                // Invalid price, remove the entry or set it null
                console.warn(`Invalid price for ${product.name} at ${supermarket}`);
                product.prices[supermarket].price = null;
            }
        } catch (err) {
            console.error(`Error parsing price:`, err);
            product.prices[supermarket].price = null;
        }
    }
}

// Save the cleaned data back to file
fs.writeFileSync("cleaned_supermarket_data.json", JSON.stringify(products, null, 2));
console.log("Cleaning complete. Saved to cleaned_supermarket_data.json");