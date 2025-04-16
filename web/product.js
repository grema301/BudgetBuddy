document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productName = urlParams.get("name");

    if (!productName) {
        document.getElementById("product-container").innerHTML = "<p>Product not found.</p>";
        return;
    }

    fetch(`/products/${encodeURIComponent(productName)}`)
        .then((response) => response.json())
        .then((data) => {
            const product = data.productData;
            if (!product) {
                document.getElementById("product-container").innerHTML = "<p>Product not found.</p>";
                return;
            }
            displayProduct(product);
        })
        .catch((error) => console.error("Error loading JSON:", error));
});

function displayProduct(product) {
    console.log("displayProduct called");
    console.log(product);
    const { name, prices, image_url } = product;

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
                    <span href="${storeData.link}" target="_blank">${store}: $${numericPrice.toFixed(2)}</span>
                </div>`;
    }).join("");

    document.getElementById("product-container").innerHTML = `
        <img src="${image_url}" alt="${name}">
        <h2>${name}</h2>
        ${priceDisplay}
    `;
}
