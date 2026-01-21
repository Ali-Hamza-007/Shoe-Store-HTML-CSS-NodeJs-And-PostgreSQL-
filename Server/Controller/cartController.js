const Cart = require("../models/cartModel");
const pool = require("../Config/db");

// Product Added To Cart

exports.addToCart = async (req, res) => {
    try {
        const item = req.body;
        const addedItem = await Cart.addToCart(item);
        res.status(200).json({ message: "Item added to cart", item: addedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Product Got To Cart 

exports.getCart = async (req, res) => {
    try {
        const { userId } = req.query;
        const cart = await Cart.getCart(userId);
        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Product Removed from Cart 

exports.removeItem = async (req, res) => {
    try {
        const { userId, productId, size } = req.body;
        await Cart.removeItem(userId, productId, size);
        res.status(200).json({ message: "Item removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


// UPDATE CART ITEM 

exports.updateCartItem = async (req, res) => {
    const { userId, productId, oldSize, newSize, quantity } = req.body;

    try {
        const result = await pool.query(
            `
            UPDATE cart_items
            SET size = $1,
                quantity = $2
            WHERE user_id = $3
              AND product_id = $4
              AND size = $5
            `,
            [newSize, quantity, userId, productId, oldSize]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Cart item not found"
            });
        }

        res.json({ message: "Cart updated" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
