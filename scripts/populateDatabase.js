const fs = require("fs");
const {
    insertSupermarket,
    insertProduct,
    insertPrice, 
    updateProductCategory,
    addToCategory,
} = require("../database/populateDAO");
const { getProductByName } = require("../database/ProductDAO");
const aiCat = require("../aiCategorizer.js");

const rawData = fs.readFileSync("cleaned_supermarket_data.json", "utf8");
const products = JSON.parse(rawData);

async function populate() {
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const supermarkets = Object.keys(product.prices);
        for (const name of supermarkets) {
            await insertSupermarket(name);
        }
        // Use the AI categorizer to get the category name
        let tryNums = 0; //Number of attempts to categorize the product
        let category = null;
        while(tryNums < 5) {
            try {
                category = await aiCat(product.name);
                if (category) break;
            } catch (error) {
                console.error("Error categorizing product:", error);
                // Retry after a short delay
                await new Promise(resolve => setTimeout(resolve, 1000));// 1 second delay
            }
            tryNums++;
        }
        let productId = null;
        if(category){
            console.log("Category found:", category);
            console.log("Product name:", product.name);
            productId = await insertProduct(product.name, product.image_url, category); //add it if it exists
        }else{
            productId = await insertProduct(product.name, product.image_url, "Other");// category will be Other if it fails to categorize
        }

        for (const [store, details] of Object.entries(product.prices)) {
            await insertPrice(productId, store, details.price);
        }
    }

    console.log("✅ Population complete");
}

async function updateCategory(){
    for(let i = 50; i < products.length; i++){
        const product = products[i];
        let tryNums = 0; //Number of attempts to categorize the product
        let category = null;
        while(tryNums < 5) {
            try {
                category = await aiCat(product.name);
                if (category) break;
            } catch (error) {
                console.error("Error categorizing product:", error);
                // Retry after a short delay
                await new Promise(resolve => setTimeout(resolve, 5000));// 1 second delay
            }
            tryNums++;
            await sleep(5000); // delay between API calls
        }
        if(category){
            console.log("Category found:", category);
            console.log("Product name:", product.name);
            await addToCategory(category);
            let result = await updateProductCategory(product.name, category); //add it if it exists
            if(result){
                console.log("Category updated:", result[0].category_name); // print out the updated category
            }

        }else{
            console.log("Failed to categorize product:", product.name);
        }
    await sleep(5000); // delay between API calls
    }
    console.log("✅ Category update complete");
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

updateCategory().catch(console.error);