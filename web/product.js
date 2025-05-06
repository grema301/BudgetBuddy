document.addEventListener("DOMContentLoaded", () => {

    const pathParts = window.location.pathname.split("/");
    const productName = decodeURIComponent(pathParts[pathParts.length - 1]);

    fetch(`/api/products/${productName}`)
        .then((response) => response.json())
        .then((data) => {
            if(!data || !data.length){
                console.error("No product found with that name.");
                document.getElementById("product-container").innerHTML = "<p>Product not found.</p>";
                return;
            }

            //Group data by product_id
            const mainProduct = {
                product_id: data[0].product_id,
                product_name: data[0].product_name,
                image_url: data[0].image_url,
                description: data[0].description,
                category_name: data[0].category_name,
                supermarkets: []  // we'll populate this below
            };
            // Group by supermarket
            data.forEach(item => {
                mainProduct.supermarkets.push({
                    name: item.supermarket_name,
                    price: item.price
                });
            });
            displayProduct(mainProduct);
        })
        .catch((error) => console.error("Error loading JSON:", error));
});

function displayProduct(product) {
    const { product_name, image_url, supermarkets } = product;
    let prices = supermarkets.map((store) => {
        return {
            name: store.name,
            price: parseFloat(store.price)
        };
    })

    // Convert price values to numbers
    let priceArray = Object.values(prices)
        .map((storeData) => parseFloat(storeData.price))
        .filter((p) => !isNaN(p));

    if (priceArray.length < 2) return;

    // Filter out extreme outliers (price must not exceed 3x any other price)
    let filteredPrices = priceArray.filter((p) =>
        priceArray.every((other) => p <= other * 3)
    );

    // Get the lowest price from the filtered prices
    let lowestPrice = Math.min(...filteredPrices);

    let priceDisplay = Object.entries(prices).map(([store, storeData]) => {
        let numericPrice = parseFloat(storeData.price);
        if (!filteredPrices.includes(numericPrice)) return "";
        return `<div class="price ${numericPrice === lowestPrice ? "lowest" : ""}">
                    <span href="${storeData.link}" target="_blank">${storeData.name}: $${numericPrice.toFixed(2)}</span>
                </div>`;
    }).join("");

    document.getElementById("product-container").innerHTML = `
        <img src="${image_url}" alt="${product_name}">
        <h2>${product_name}</h2>
        ${priceDisplay}
    `;
}
