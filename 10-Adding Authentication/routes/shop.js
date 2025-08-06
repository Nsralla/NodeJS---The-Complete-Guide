// const path = require('path');
// const rootDir = require('../util/path'); // Importing the utility path module

const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop');
const isAuth = require('../middleware/isAuth'); // Import the authentication middleware
// http://localhost:3000/ GET reqest TO DSIAPLY all products
router.get('/', shopController.getIndexPage);
router.get('/products', shopController.getShowProducts);
// router.get('/products/delete/:productId', shopController.deleteProduct);
router.get('/products/:productId', shopController.getProductDetails); // GET request to display product details
router.get('/cart', isAuth, shopController.getCart);
router.post('/cart', isAuth, shopController.postCart);  // add product to cart
router.post('/cart/delete/:productId', isAuth, shopController.deleteProductFromCart); // DELETE request to remove product from cart
router.get('/orders', isAuth, shopController.getOrders);

// router.get('/checkout', shopController.getCheckout);
router.post('/create-order', isAuth, shopController.postOrder);


module.exports = {
    router: router
};