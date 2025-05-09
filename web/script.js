
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
        <a href="product.html?name=${encodeURIComponent(name)}" class="product-page">
          <img src="${image_url}" alt="${name}">
          <div class="product-name">${name}</div>
        </a>
        ${priceDisplay}
        <div class="cart-controls">
          <button class="add-to-cart">Add to Cart</button>
          <div class="quantity-control hidden" data-name="${name}">
            <button class="minus">-</button>
            <input type="number" value="1" min="1" class="qty-input">
            <button class="plus">+</button>
          </div>
        </div>
        <div class="cart-count" data-name="${name}"></div>
    `;

        // Stop card click if clicking the button
        // productCard.querySelector(".add-to-cart").addEventListener("click", (e) => {
        //     e.stopPropagation(); // Prevent redirect
        //     addToCart(name);
        // });

        const addBtn = productCard.querySelector(".add-to-cart");
        const qtyInput = productCard.querySelector(".qty-input");
        const minusBtn = productCard.querySelector(".minus");
        const plusBtn = productCard.querySelector(".plus");
        const quantityDiv = productCard.querySelector(".quantity-control");

        addBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const qty = parseInt(qtyInput.value) || 1;
            addToCart(name, qty);
            
            addBtn.classList.add('hidden');
            quantityDiv.classList.remove('hidden');
            qtyInput.value = getCartQuantity(name);
        });

        plusBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const updated = parseInt(qtyInput.value) + 1;
            qtyInput.value = updated;
            updateQuantity(name, updated);
        });

        minusBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const updated = parseInt(qtyInput.value) - 1;
            if (updated > 1) {
              qtyInput.value = updated;
              updateQuantity(name, updated);
            } else {
              removeFromCart(name);
              quantityDiv.classList.add('hidden');
              addBtn.classList.remove('hidden');
            }
        });

        qtyInput.addEventListener("change", (e) => {
          const value = parseInt(e.target.value);
          if (value > 0){
            updateQuantity(name, value);
          } else {
            removeFromCart(name);
            quantityDiv.classList.add('hidden');
            addBtn.classList.remove('hidden');
          }
        });

        const existingQty = getCartQuantity(name);
        if (existingQty > 0){
          addBtn.classList.add('hidden');
          quantityDiv.classList.remove('hidden');
          qtyInput.value = existingQty;
        }
        updateCartCountDisplay(name);
        productGrid.appendChild(productCard);
    });
}


let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function updateCartCountDisplay(name){
  const countDiv = document.querySelector(`.cart-count[data-name="${name}"]`);
  const item = cart.find(item => item.name === name);

  if (countDiv){
    if (item && item.quantity > 0){
      countDiv.textContent = `In cart: ${item.quantity}`;
      countDiv.style.display = "block";
    } else {
      countDiv.textContent = "";
      countDiv.style.display = "none";
    }
  }
}

function addToCart(name, quantity = 1) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ name, quantity});
  }
  saveCart();
  updateCartCountDisplay(name);
}

function getCartQuantity(name){
  const item = cart.find(i => i.name === name);
  return item ? item.quantity : 0;
}

function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  saveCart();
  updateCartCountDisplay(name);

  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach((card) => {
    const productName = card.querySelector('.product-name').textContent;
    if (productName === name) {
      const addBtn = card.querySelector('.add-to-cart');
      const quantityDiv = card.querySelector('.quantity-control');
      const qtyInput = card.querySelector('.qty-input');
      addBtn.classList.remove('hidden');
      quantityDiv.classList.add('hidden');
      if (qtyInput) qtyInput.value = 1;
    }
  });
}

function updateQuantity(name, qty) {
  const item = cart.find(i => i.name === name);
  if (item) {
    item.quantity = parseInt(qty);
    if (item.quantity <= 0) removeFromCart(name);
    else {
      saveCart();
      updateCartCountDisplay(name);
    }
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
    updateCartCountDisplay(item.name);
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
  if (document.getElementById('cart').classList.contains('open')) document.getElementById('cart-close').style.display = "block";
  else document.getElementById('cart-close').style.display = "none";
};

// On page load
window.addEventListener('DOMContentLoaded', () => {
  renderCart();

  document.getElementById('cart-close').addEventListener("click", () => {
    document.getElementById('cart').classList.remove('open');
    document.getElementById('cart-close').style.display = "none";
  });
});

// Send cart to server to get AI suggestions
document.getElementById('get-recipes-btn').addEventListener('click', () => {
  fetch('/ai/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById('ai-output').innerHTML = `<p><strong>AI:</strong> ${data.response}</p>`;
  })
  .catch(err => console.error('Error with AI suggestion:', err));
});

// Handle chat replies
document.getElementById('send-reply').addEventListener('click', () => {
  const userInput = document.getElementById('user-reply').value;
  if (!userInput) return;

  document.getElementById('ai-output').innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
  document.getElementById('user-reply').value = '';

  fetch('/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userInput })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById('ai-output').innerHTML += `<p><strong>AI:</strong> ${data.response}</p>`;
  })
  .catch(err => console.error('Error during chat:', err));
});

