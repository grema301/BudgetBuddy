
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
    console.log("Trying to fetch products...");
    fetch("/products")
        .then((response) => response.json())
        .then((data) => displayProducts(data))
        .catch((error) => console.error("Error loading JSON:", error));
});

function displayProducts(data) {
    const productGrid = document.getElementById("product-grid");
    productGrid.innerHTML = "";

    //Format the queried data to match the expected structure
    // Group data by product_id
    const grouped = {};

    data.forEach((item) => {
        const {
            product_id,
            product_name,
            image_url,
            supermarket_name,
            price
        } = item;

        if (!grouped[product_id]) {
            grouped[product_id] = {
                name: product_name,
                image_url: image_url,
                prices: {}
            };
        }

        grouped[product_id].prices[supermarket_name] = {
            price: parseFloat(price)
        };
    });

    // Convert grouped object back to array
    const products = Object.values(grouped);
    console.log(products);
    console.log("Products after grouping:", products);

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

        console.log(filteredPrices);
        let priceDisplay = Object.entries(prices)
            .map(([store, storeData]) => {
                let numericPrice = parseFloat(storeData.price);
                if (!filteredPrices.includes(numericPrice)) return "";
                return `<div class="price ${numericPrice === lowestPrice ? "lowest" : ""}">
                    <p>${store}: $${numericPrice.toFixed(2)}</p>
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
