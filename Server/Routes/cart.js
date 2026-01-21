const express = require("express");
const router = express.Router();
const cartController = require("../Controller/cartController.js");


router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/", cartController.updateCartItem);
router.delete("/", cartController.removeItem);

module.exports = router;
