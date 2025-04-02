
document.getElementById('clearSearch').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    searchProducts(); 
});

document.getElementById("searchButton").addEventListener("click", searchProducts);

function searchProducts() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const productCards = document.querySelectorAll(".product-card");

    productCards.forEach((card) => {
        const productName = card.querySelector(".product-name").textContent.toLowerCase();
        card.style.display = productName.includes(searchTerm) ? "block" : "none";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    fetch("merged_supermarket_data.json")
        .then((response) => response.json())
        .then((data) => displayProducts(data))
        .catch((error) => console.error("Error loading JSON:", error));
});

function displayProducts(products) {
    const productGrid = document.getElementById("product-grid");
    productGrid.innerHTML = "";

    products.forEach((product) => {
        const { name, prices, image_url } = product;

        // Convert prices to numeric array, handling new JSON structure
        let priceArray = Object.values(prices)
            .map((storeData) => parseFloat(storeData.price))
            .filter((p) => !isNaN(p));

        if (priceArray.length < 2) return; // Skip if not enough valid prices

        // Filter out extreme outliers (price must not exceed 3x any other price)
        let filteredPrices = priceArray.filter((p) =>
            priceArray.every((other) => p <= other * 3)
        );

        if (filteredPrices.length < 2) return; // Ensure at least 2 valid prices remain

        let lowestPrice = Math.min(...filteredPrices);

        let priceDisplay = Object.entries(prices)
            .map(([store, storeData]) => {
                let numericPrice = parseFloat(storeData.price);
                if (!filteredPrices.includes(numericPrice)) return "";
                return `<div class="price ${numericPrice === lowestPrice ? "lowest" : ""}">
                            <a href="${storeData.link}" target="_blank">${store}: $${numericPrice.toFixed(2)}</a>
                        </div>`;
            })
            .join("");

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
