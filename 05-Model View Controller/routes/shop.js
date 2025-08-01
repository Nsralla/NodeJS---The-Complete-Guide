// const path = require('path');
// const rootDir = require('../util/path'); // Importing the utility path module

const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products');

router.get('/',productsController.getShowProducts);
module.exports = {
    router:router
};