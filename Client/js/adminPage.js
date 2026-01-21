const addProductBtn = document.getElementById("addProductBtn");
const modal = document.getElementById("productModal");
const closeBtn = document.querySelector(".close");
const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");
const token = localStorage.getItem("token");


// Fetch Products (GET)
async function loadProducts() {
    try {
        const response = await fetch("http://localhost:5000/api/adminProducts", {
            headers: { "Authorization": `Bearer ${token}` }
        });



        const products = await response.json();
        productList.innerHTML = "";

        if (products.length === 0) {
            productList.innerHTML = "<p>No products found.</p>";
            return;
        }

        products.forEach(item => {
            const div = document.createElement("div");
            div.className = "product-item";
            div.innerHTML = `
        <img src="${item.image || item.image_url}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p>Price: $${item.price}</p>
        <button class="remove-btn" onclick="deleteProduct(${item.id})">Delete</button>
    `;
            productList.appendChild(div);
        });
    } catch (error) {
        productList.innerHTML = "<p>Error loading products from server.</p>";
    }
}

//  Add Product (POST)
productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const product = {
        name: document.getElementById("name").value,
        price: Number(document.getElementById("price").value),
        image: document.getElementById("image").value
    };

    try {
        const response = await fetch("http://localhost:5000/api/adminProducts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(product)
        });

        if (response.ok) {
            alert("Product added successfully!");
            productForm.reset();
            modal.style.display = "none";
            loadProducts(); // Refresh list immediately
        } else {
            const err = await response.json();
            alert(err.message || "Failed to add product");
        }
    } catch (error) {
    console.log("Error Details:", error); 
    alert("Server connection failed. Check console for details.");
}
});

//  Delete Product (DELETE)
window.deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/adminProducts/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            loadProducts();
        } else {
            alert("Delete failed.");
        }
    } catch (error) {
        console.error(error);
    }
};

// --- Modal Controls ---
addProductBtn.onclick = () => modal.style.display = "flex";
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

// --- Logout ---
document.getElementById("logoutBtn").onclick = () => {
    localStorage.clear();
    window.location.href = "login.html";
};
loadProducts();
