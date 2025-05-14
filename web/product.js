
document.addEventListener("DOMContentLoaded", () => {
    const productName = window.location.href.split("/").pop().split("?")[0];
    console.log("Product Name:", productName);

    if (!productName) {
        document.getElementById("product-container").innerHTML = "<p>Product not found.</p>";
        return;
    }
    fetch(`/api/products/${encodeURIComponent(productName)}`)
        .then((response) => response.json())
        .then((data) => {
            const product = data
            if (!product) {
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
    console.log("displayProduct called");
    console.log(product);
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
        console.log("Store data:", storeData.name);
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

