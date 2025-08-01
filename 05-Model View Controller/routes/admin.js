// const path = require('path');
// const rootDir = require('../util/path'); // Importing the utility path module
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
const productsController = require('../controllers/products');

router.get('/add-product',productsController.getAddProductPage) // will only trigger on GET request
router.post('/add-product',productsController.postAddProduct);


module.exports = {
    router: router
};