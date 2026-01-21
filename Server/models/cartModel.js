const pool = require("../Config/db");
// Updating Cart Items
async function updateCartItem(userId, productId, oldSize, newSize, quantity) {

    // If size not changed → only update quantity
    if (oldSize === newSize) {
        const res = await pool.query(
            `UPDATE cart_items
             SET quantity=$1, updated_at=NOW()
             WHERE user_id=$2 AND product_id=$3 AND size=$4
             RETURNING *`,
            [quantity, userId, productId, oldSize]
        );
        return res.rows[0];
    }

    // If size changed → delete old + insert/update new
    await pool.query(
        `DELETE FROM cart_items
         WHERE user_id=$1 AND product_id=$2 AND size=$3`,
        [userId, productId, oldSize]
    );

    const res = await pool.query(
        `INSERT INTO cart_items (user_id, product_id, name, price, size, image, quantity)
         SELECT user_id, product_id, name, price, $4, image, $5
         FROM cart_items
         WHERE user_id=$1 AND product_id=$2
         LIMIT 1
         ON CONFLICT (user_id, product_id, size)
         DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
         RETURNING *`,
        [userId, productId, oldSize, newSize, quantity]
    );

    return res.rows[0];
}




// Add or update cart item
async function addToCart(item) {
    const { userId, productId, name, price, size, image, quantity } = item;

    // If item exists, increment quantity
    const query = `
        INSERT INTO cart_items (user_id, product_id, name, price, size, image, quantity)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id, product_id, size)
        DO UPDATE SET quantity = cart_items.quantity + $7, updated_at = NOW()
        RETURNING *;
    `;

    const values = [userId, productId, name, price, size, image, quantity];
    const res = await pool.query(query, values);
    return res.rows[0];
}

// Get cart for user
async function getCart(userId) {
    const res = await pool.query("SELECT * FROM cart_items WHERE user_id=$1 ORDER BY created_at DESC", [userId]);
    return res.rows;
}

// Remove item from cart
async function removeItem(userId, productId, size) {
    await pool.query("DELETE FROM cart_items WHERE user_id=$1 AND product_id=$2 AND size=$3", [userId, productId, size]);
}

module.exports = { addToCart, getCart, removeItem ,updateCartItem };
