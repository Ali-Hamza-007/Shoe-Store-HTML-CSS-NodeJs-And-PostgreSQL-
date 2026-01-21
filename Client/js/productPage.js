document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", async function () {


        const role = localStorage.getItem("role");
        console.log("User role:", role);
        if (role == "admin") {
            
            alert("Please First logIn as User.");
            
            return;
        }

        const card = this.closest(".g-product-card");
        if (!card) return;

        const sizeSelect = card.querySelector(".product-size");
        if (!sizeSelect || !sizeSelect.value) {
            alert("Please select a size");
            return;
        }

        //  Get the token from localStorage
        const token = localStorage.getItem("token");

        //  If no token, the user isn't logged in
        if (!token) {
            alert("Please login first to add items to your cart!");
            window.location.href = "login.html";
            return;
        }

        const product = {
            productId: card.dataset.id,
            name: card.dataset.name,
            price: Number(card.dataset.price),
            size: sizeSelect.value,
            image: card.querySelector("img").src,
            quantity: 1
           
        };
// POST Request 
        try {
            const response = await fetch("http://localhost:5000/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    //  ADD TOKEN 
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(product)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Product added to cart!");
            } else {
                // If token is expired or invalid
                if (response.status === 401 || response.status === 403) {
                    alert("Session expired. Please login again.");
                    window.location.href = "login.html";
                } else {
                    alert(result.message || "Failed to add product");
                }
            }

        } catch (error) {
            console.error(error);
            alert("Could not connect to server.");
        }
    });
});

// Dynamic loading of products ( That are added recently by admin )

document.addEventListener("DOMContentLoaded", () => {
    loadNewArrivals();
});
async function loadNewArrivals() {
    const container = document.getElementById("dynamicProductContainer");
    if (!container) return;

    try {
        const response = await fetch("http://localhost:5000/api/products/public");
        const products = await response.json();

        // Clear container first if needed
        container.innerHTML = "";

        products.forEach(product => {
            const productCard = document.createElement("div");
            productCard.className = "g-product-card";

            // Set data attributes
            productCard.dataset.id = product.id;
            productCard.dataset.name = product.name;
            productCard.dataset.price = product.price;

            productCard.innerHTML = `
                <div class="pic-box">
                    <span class="padge">Arrival</span>
                    <img src="${product.image}" alt="${product.name}">
                    <ul class="icons">
                        <li>
                            <span class="icon-description">add to cart</span>
                            <div class="icon add-to-cart-btn"><ion-icon name="cart-outline"></ion-icon></div>
                        </li>
                        <li>
                            <span class="icon-description">wishlist</span>
                            <div class="icon"><ion-icon name="heart-outline"></ion-icon></div>
                        </li>
                    </ul>
                </div>
                <div class="data-box">
                    <div class="data-links"><a href="#">new</a>/<a href="#">collection</a></div>
                    <h2><a href="#">${product.name}</a></h2>
                    <span>$${product.price}</span>
                    <div class="product-size-wrapper">
                        <label>Size:</label>
                        <select class="product-size">
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                        </select>
                    </div>
                </div>
            `;

            container.appendChild(productCard);

            // Attach event listener specifically to THIS card's button
            const cartBtn = productCard.querySelector(".add-to-cart-btn");
            cartBtn.addEventListener("click", () => handleAddToCart(productCard));
        });
    } catch (error) {
        console.error("Could not load dynamic products:", error);
    }
}

// Separate function to handle logic 
async function handleAddToCart(card) {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (role === "admin") {
        alert("Please First log in as a User ");
        return;
    }

    if (!token) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    const sizeSelect = card.querySelector(".product-size");
    const productData = {
        productId: card.dataset.id,
        name: card.dataset.name,
        price: Number(card.dataset.price),
        size: sizeSelect.value,
        image: card.querySelector("img").src,
        quantity: 1
    };

    try {
        const response = await fetch("http://localhost:5000/api/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            alert("Added to cart!");
        } else {
            const result = await response.json();
            alert(result.message || "Error adding to cart");
        }
    } catch (err) {
        alert("Server error. Please try again later.");
    }
}