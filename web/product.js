document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productName = urlParams.get("name");

    if (!productName) {
        document.getElementById("product-container").innerHTML = "<p>Product not found.</p>";
        return;
    }

    fetch("merged_supermarket_data.json")
        .then((response) => response.json())
        .then((data) => {
            const product = data.find((p) => p.name === productName);
            if (!product) {
                document.getElementById("product-container").innerHTML = "<p>Product not found.</p>";
                return;
            }
            displayProduct(product);
        })
        .catch((error) => console.error("Error loading JSON:", error));
});

function displayProduct(product) {
    const { name, prices, image_url } = product;
    let priceArray = Object.values(prices).map((storeData) => parseFloat(storeData.price)).filter((p) => !isNaN(p));

    if (priceArray.length < 2) return;

    let filteredPrices = priceArray.filter((p) => 
        priceArray.every(other => p <= other * 3)
    );

    let lowestPrice = Math.min(...filteredPrices);

    let priceDisplay = Object.entries(prices).map(([store, storeData]) => {
        let numericPrice = parseFloat(storeData.price);
        if (!filteredPrices.includes(numericPrice)) return "";
        return `<div class="price ${numericPrice === lowestPrice ? "lowest" : ""}">
                    <a href="${storeData.link}" target="_blank">${store}: $${numericPrice.toFixed(2)}</a>
                </div>`;
    }).join("");

    document.getElementById("product-container").innerHTML = `
        <img src="${image_url}" alt="${name}">
        <h2>${name}</h2>
        ${priceDisplay}
    `;
}
