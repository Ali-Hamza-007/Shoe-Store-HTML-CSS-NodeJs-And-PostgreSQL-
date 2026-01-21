// Get the token from storage 
const token = localStorage.getItem("token"); 
const cartContainer = document.getElementById("cartContainer");
const cartTotalEl = document.getElementById("cartTotal");

// Helper function to handle unauthorized access
function checkAuth(response) {
    if (response.status === 401 || response.status === 403) {
        alert("Session expired. Please log in again.");
        window.location.href = "logIn.html";
        return false;
    }
    return true;
}

// ================= LOAD CART =================
async function loadCart() {
    if (!token) {
        window.location.href = "logIn.html";
        return;
    }

    try {
        // Send Token in Headers.
        const response = await fetch(`http://localhost:5000/api/cart`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!checkAuth(response)) return;
        
        const cart = await response.json();
        if (!response.ok) throw new Error("Failed to fetch cart");

        cartContainer.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            cartContainer.innerHTML = "<p>Your cart is empty.</p>";
            cartTotalEl.textContent = "";
            return;
        }

        cart.forEach(item => {
            total += Number(item.price) * Number(item.quantity);
            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h3>${item.name}</h3>
                    <p>Price: $${item.price}</p>
                    <label>Size:</label>
                    <select class="size-select">
                        <option value="7" ${item.size == 7 ? "selected" : ""}>7</option>
                        <option value="8" ${item.size == 8 ? "selected" : ""}>8</option>
                        <option value="9" ${item.size == 9 ? "selected" : ""}>9</option>
                        <option value="10" ${item.size == 10 ? "selected" : ""}>10</option>
                    </select>
                    <label>Qty:</label>
                    <input type="number" class="qty-input" min="1" value="${item.quantity}">
                    <br><br>
                    <button class="update-btn">Update</button>
                    <button class="remove-btn">Remove</button>
                </div>
            `;

            const sizeSelect = div.querySelector(".size-select");
            const qtyInput = div.querySelector(".qty-input");
            
            div.querySelector(".update-btn").addEventListener("click", () => {
                updateCartItem(item.product_id, item.size, Number(sizeSelect.value), Number(qtyInput.value));
            });

            div.querySelector(".remove-btn").addEventListener("click", () => {
                removeItem(item.product_id, item.size);
            });

            cartContainer.appendChild(div);
        });

        cartTotalEl.textContent = `Total: $${total.toFixed(2)}`;

    } catch (error) {
        console.error(error);
        cartContainer.innerHTML = "<p>Failed to load cart.</p>";
    }
}

// ================= UPDATE ITEM =================
async function updateCartItem(productId, oldSize, newSize, quantity) {
    try {
        const response = await fetch("http://localhost:5000/api/cart", {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` //  Add Token
            },
            body: JSON.stringify({
                productId,
                oldSize,
                newSize,
                quantity
            })
        });

        if (!checkAuth(response)) return;
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        await loadCart();
        alert("Cart updated successfully");
    } catch (error) {
        console.error(error);
        alert("Failed to update cart");
    }
}

// ================= REMOVE ITEM =================
async function removeItem(productId, size) {
    try {
        const response = await fetch("http://localhost:5000/api/cart", {
            method: "DELETE",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Add Token
            },
            body: JSON.stringify({
                productId,
                size
            })
        });

        if (!checkAuth(response)) return;
        if (!response.ok) throw new Error("Failed to remove item");

        alert("Item removed");
        loadCart();
    } catch (error) {
        console.error(error);
        alert("Error removing item");
    }
}

loadCart();