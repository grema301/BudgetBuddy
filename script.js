document.addEventListener("DOMContentLoaded", () => {
    fetch("merged_supermarket_data.json") // Update with the actual JSON path
        .then(response => response.json())
        .then(data => displayProducts(data))
        .catch(error => console.error("Error loading JSON:", error));
});

function displayProducts(products) {
    const productGrid = document.getElementById("product-grid");
    productGrid.innerHTML = "";

    products.forEach(product => {
        const { name, prices, image_url } = product;
        let priceArray = Object.values(prices).map(p => parseFloat(p)).filter(p => !isNaN(p));

        if (priceArray.length < 2) return; // Skip if not enough valid prices

        // Identify outliers (if one price is 3x the others, exclude it)
        let filteredPrices = priceArray.filter(p => 
            priceArray.every(other => p <= other * 3)
        );

        // If only one price remains after filtering, skip the product
        if (filteredPrices.length < 2) return;

        // Determine lowest price
        let lowestPrice = Math.min(...filteredPrices);
        
        // Generate price display
        let priceDisplay = Object.entries(prices).map(([store, price]) => {
            let numericPrice = parseFloat(price);
            if (!filteredPrices.includes(numericPrice)) return ""; // Hide outlier
            return `<div class="price ${numericPrice === lowestPrice ? "lowest" : ""}">${store}: $${numericPrice.toFixed(2)}</div>`;
        }).join("");

        // Create product card
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
            <img src="${image_url}" alt="${name}">
            <div class="product-name">${name}</div>
            ${priceDisplay}
        `;

        productGrid.appendChild(productCard);
    });
}
