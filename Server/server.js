require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./Config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authenticateToken = require('./middleware/auth.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- AUTH ROUTES ---

// Register Route
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username",
            [username, email || null, hashedPassword]
        );
        res.status(201).json({ message: "User created", user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "User already exists or database error" });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (user.rows.length === 0) return res.status(400).json({ message: "User not found" });

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) return res.status(403).json({ message: "Invalid password" });

        const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, username: user.rows[0].username });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- CART ROUTES ---

// ADD TO CART
app.post('/api/cart', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; 
        const { productId, name, price, size, image, quantity } = req.body;

        // Check if item already exists for this user with the same size
        const existingItem = await pool.query(
            "SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2 AND size = $3",
            [userId, productId, size]
        );

        if (existingItem.rows.length > 0) {
            // Update quantity if it exists
            await pool.query(
                "UPDATE cart_items SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2",
                [quantity, existingItem.rows[0].id]
            );
            res.json({ message: "Quantity updated in cart" });
        } else {
            // Insert using your exact column names: product_id, name, price, user_id, size, image, quantity
            await pool.query(
                "INSERT INTO cart_items (product_id, name, price, user_id, size, image, quantity) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                [productId, name, price, userId, size, image, quantity]
            );
            res.status(201).json({ message: "Added to cart" });
        }
    } catch (err) {
        console.error("DB Error:", err.message);
        res.status(500).json({ message: "Server error while adding to cart" });
    }
});

// GET CART
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; 
        const cart = await pool.query("SELECT * FROM cart_items WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
        res.json(cart.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error fetching cart");
    }
});

// UPDATE CART (Change Size or Quantity)
app.put('/api/cart', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId, oldSize, newSize, quantity } = req.body;
        
        await pool.query(
            "UPDATE cart_items SET size = $1, quantity = $2, updated_at = NOW() WHERE user_id = $3 AND product_id = $4 AND size = $5",
            [newSize, quantity, userId, productId, oldSize]
        );
        res.json({ message: "Cart updated" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error updating cart");
    }
});

// DELETE FROM CART
app.delete('/api/cart', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId, size } = req.body;
        await pool.query(
            "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 AND size = $3",
            [userId, productId, size]
        );
        res.json({ message: "Item removed" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error removing item");
    }
});



// POST API for Adding Products Newly added by Admin

app.post('/api/adminProducts', authenticateToken, async (req, res) => {
    const { name, price, image } = req.body;
    
    // Use .userId because that is what you put in the token during login
    const userId = req.user.userId; 

    console.log("Adding product for User ID:", userId);

    try {
        const query = `
            INSERT INTO products (id, name, price, image) 
            VALUES (nextval('seq_product_id'), $1, $2, $3) 
            RETURNING *`;
            
        const values = [name, price, image];
        const result = await pool.query(query, values);
        
        res.status(201).json({
            message: "Product added to DB!",
            product: result.rows[0]
        });
    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).json({ message: "Database error", error: err.message });
    }
});
// GET API for Getting Products Newly added by Admin
app.get('/api/adminProducts', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch products" });
    }
});
// DELETE API for Deleting Products Newly added by Admin
app.delete('/api/adminProducts/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.status(200).json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
});
// GET API for getting products and showing publically
app.get('/api/products/public', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});
// Server Running 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));