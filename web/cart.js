document.addEventListener("DOMContentLoaded", () => {
    const cartContainer = document.getElementById("cart-items");
    const totalsContainer = document.getElementById("totals");
    const clearCartBtn = document.getElementById("clear-cart");
  
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
    if (cart.length === 0) {
      cartContainer.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }
  
    const renderCart = () => {
      cartContainer.innerHTML = "";
      cart.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "product-card";
  
        card.innerHTML = `
          <img src="${item.image_url}" alt="${item.name}">
          <h2>${item.name}</h2>
          <label>
            Qty: 
            <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="qty-input">
          </label>
          <button class="remove-btn" data-index="${index}">Remove</button>
        `;
  
        cartContainer.appendChild(card);
      });
  
      attachCartEventHandlers();
      updateTotals();
    };
  
    const attachCartEventHandlers = () => {
      document.querySelectorAll(".qty-input").forEach(input => {
        input.addEventListener("change", e => {
          const i = parseInt(e.target.dataset.index);
          const val = parseInt(e.target.value);
          if (val > 0) {
            cart[i].quantity = val;
            saveCart();
            updateTotals();
          }
        });
      });
  
      document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const i = parseInt(e.target.dataset.index);
          cart.splice(i, 1);
          saveCart();
          renderCart();
        });
      });
    };
  
    const saveCart = () => {
      localStorage.setItem("cart", JSON.stringify(cart));
    };
  
    const updateTotals = () => {
      fetch("/cart/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      })
        .then(res => res.json())
        .then(totals => {
          totalsContainer.innerHTML = `
            <h2>Total Prices</h2>
            <ul>
              ${Object.entries(totals).map(
                ([store, total]) =>
                  `<li>${store}: $${total.toFixed(2)}</li>`
              ).join("")}
            </ul>
          `;
        })
        .catch(err => {
          totalsContainer.innerHTML = "<p>Error fetching totals</p>";
          console.error(err);
        });
    };
  
    clearCartBtn.addEventListener("click", () => {
      localStorage.removeItem("cart");
      cart = [];
      cartContainer.innerHTML = "<p>Your cart is empty.</p>";
      totalsContainer.innerHTML = "";
    });
  
    renderCart();
  });
  