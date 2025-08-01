const path = require('path');
const express = require('express');
const router = express.Router();
const rootDir = require('../util/path'); // Importing the utility path module

const products = require('./admin').products; // Importing products from admin routes

router.get('/',(req, res, next) => { // get doesn't act like use, the url must match exactly
    console.log('shop.js', products);
    // send products to the shop page
    res.render('shop', {
        products: products,
        pageTitle: 'Shop',
        hasProducts: products.length > 0,
        productCss: true,
        formCss: 'add-product.css'
    });

});

module.exports = {
    router:router
};