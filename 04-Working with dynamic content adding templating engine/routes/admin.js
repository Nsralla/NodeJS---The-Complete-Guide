const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const rootDir = require('../util/path'); // Importing the utility path module
router.use(bodyParser.urlencoded({ extended: false }));

const products = [];

router.get('/add-product',(req,res,next)=>{
    res.render('add-product', { pageTitle: 'Add Product', formCss: 'add-product.css' }); // Render add-product view with a title and CSS
})
router.post('/add-product',(req,res,next)=>{ // will only trigger on POST request
    products.push({title: req.body.title});
    res.redirect('/shop'); // Redirect to shop page after adding product
});


module.exports = {
    router: router,
    products: products
};