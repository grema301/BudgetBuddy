
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
    // Fetch the products from the backend
    fetch("/api/products") 
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();  
        })
        .then((data) => {
            if (data) {
                displayProducts(data);  // Pass products to display function
            } else {
                console.error("No products found.");
            }
        })
        .catch((error) => {
            console.error("Error loading JSON:", error);  // Handle errors
        });
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
        <button class="add-to-cart">Add to Cart</button>
    `;

        // Stop card click if clicking the button
        productCard.querySelector(".add-to-cart").addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent redirect
            addToCart(name);
        });


        productCard.addEventListener("click", () => {
            window.location.href = `/product/${encodeURIComponent(name)}`;
        });
        productGrid.appendChild(productCard);
    });
}


let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function addToCart(name) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, quantity: 1 });
  }
  saveCart();
}

function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  saveCart();
}

function updateQuantity(name, qty) {
  const item = cart.find(i => i.name === name);
  if (item) {
    item.quantity = parseInt(qty);
    if (item.quantity <= 0) removeFromCart(name);
    else saveCart();
  }
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotals = document.getElementById('cart-totals');
  cartItems.innerHTML = '';

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <span>${item.name}</span>
      <input type="number" value="${item.quantity}" onchange="updateQuantity('${item.name}', this.value)" />
      <button onclick="removeFromCart('${item.name}')">✕</button>
    `;
    cartItems.appendChild(div);
  });

  if (cart.length === 0) {
    cartTotals.innerHTML = 'Your cart is empty.';
    return;
  }

  // Fetch total prices
  fetch('/cart/prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart })
  })
  .then(res => res.json())
  .then(totals => {
    const minPrice = Math.min(...Object.values(totals));
    cartTotals.innerHTML = Object.entries(totals).map(([store, total]) => {
      const className = total === minPrice ? 'cheapest' : '';
      return `<div class="${className}">${store}: $${total.toFixed(2)}</div>`;
    }).join('');
  });
}

// Toggle cart
document.getElementById('cart-toggle').onclick = () => {
  document.getElementById('cart').classList.toggle('open');
};

// On page load
window.addEventListener('DOMContentLoaded', () => {
  renderCart();
});

