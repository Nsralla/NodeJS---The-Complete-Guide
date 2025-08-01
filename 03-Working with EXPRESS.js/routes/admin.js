const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const rootDir = require('../util/path'); // Importing the utility path module
router.use(bodyParser.urlencoded({ extended: false }));


router.get('/add-product',(req,res,next)=>{
    res.sendFile(path.join(rootDir,'views','add-product.html'));
})
router.post('/add-product',(req,res,next)=>{ // will only trigger on POST request
    console.log(req.body);
    res.redirect('/shop'); // Redirect to shop page after adding product
});


module.exports = {
    router: router
};