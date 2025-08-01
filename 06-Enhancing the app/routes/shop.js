// const path = require('path');
// const rootDir = require('../util/path'); // Importing the utility path module

const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop');

// http://localhost:3000/ GET reqest TO DSIAPLY all products
router.get('/', shopController.getIndexPage);
router.get('/products', shopController.getShowProducts);
router.get('/products/delete/:productId', shopController.deleteProduct);
router.get('/products/:productId', shopController.getProductDetails); // GET request to display product details
router.get('/cart', shopController.getCart);
router.post('/cart',shopController.postCart);  // add product to cart
router.post('/cart/delete/:productId', shopController.deleteProductFromCart); // DELETE request to remove product from cart
router.get('/orders',shopController.getOrders);
router.get('/checkout', shopController.getCheckout);


module.exports = {
    router: router
};