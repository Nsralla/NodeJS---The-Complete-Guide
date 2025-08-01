// const path = require('path');
// const rootDir = require('../util/path'); // Importing the utility path module
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
const adminController = require('../controllers/admin');

//1- admin/add-product route GET ROUTE, to display add product form
router.get('/add-product', adminController.getAddProductPage) // will only trigger on GET request
//2- admin/products route GET to display all products
router.get('/products', adminController.getProducts);

//3- admin/ add-product POST route to handle form submission
router.post('/add-product', adminController.postAddProduct);

//4- admin/delete-product/:productId route to handle product deletion
router.post('/delete-product/:productId', adminController.postDeleteProduct);

//5-admin/edit-product/:productId: edit produt route
router.get('/edit-product/:productId', adminController.getEditProductPage);

// 6-admin/edit-product/:productId 
router.post('/edit-product/:productId', adminController.postEditProduct); // POST route to handle product editing
module.exports = {
    router: router
};