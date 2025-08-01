const Product = require('../models/product'); // Import Product model

exports.getAddProductPage = (req, res, next) => {
    res.render('add-product', { pageTitle: 'Add Product', formCss: 'add-product.css' }); // Render add-product view with a title and CSS
}
exports.postAddProduct = (req,res,next)=>{ // will only trigger on POST request
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/shop'); // Redirect to shop page after adding product
}

exports.getShowProducts = (req, res, next) => { // get doesn't act like use, the url must match exactly
    // send products to the shop page
    res.render('shop', {
        products: Product.fetchAll(),
        pageTitle: 'Shop',
        hasProducts: Product.fetchAll().length > 0,
        productCss: true,
        formCss: 'add-product.css'
    });

};
