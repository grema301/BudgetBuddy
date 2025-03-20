document.addEventListener("DOMContentLoaded", () => {
    fetch("merged_supermarket_data.json") // Update with actual JSON path
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

        if (filteredPrices.length < 2) return;

        let lowestPrice = Math.min(...filteredPrices);

        let priceDisplay = Object.entries(prices).map(([store, price]) => {
            let numericPrice = parseFloat(price);
            if (!filteredPrices.includes(numericPrice)) return "";
            return `<div class="price ${numericPrice === lowestPrice ? "lowest" : ""}">${store}: $${numericPrice.toFixed(2)}</div>`;
        }).join("");

        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
            <img src="${image_url}" alt="${name}">
            <div class="product-name">${name}</div>
            ${priceDisplay}
        `;

        productCard.addEventListener("click", () => {
            window.location.href = `product.html?name=${encodeURIComponent(name)}`;
        });

        productGrid.appendChild(productCard);
    });
}
