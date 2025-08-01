
const Product = require('../models/product'); // Import Product model

exports.getAddProductPage = (req, res, next) => {
    res.render('admin/add-product',
         { pageTitle: 'Add Product',
            formCss: 'add-product.css',
            currentPage: 'add-product' }); // Render add-product view with a title and CSS
}
exports.postAddProduct = (req,res,next)=>{ // will only trigger on POST request
    const product = new Product(req.body.title,req.body.imageUrl, req.body.description, req.body.price);
    product.save();
    res.redirect('/'); // Redirect to shop page after adding product
};

exports.getProducts = (req, res, next) => {
    res.render('admin/products', {
        products: Product.fetchAll(),
        pageTitle: 'Admin Products',
        hasProducts: Product.fetchAll().length > 0,
        productCss: true,
        currentPage: 'admin-products'
    });
};

exports.postDeleteProduct = (req,res,next)=>{
    const productId = req.params.productId; // Get the product title from the request parameters
    Product.delete(productId);
    res.redirect('/admin/products'); // Redirect to the admin products page after deletion
    
}

exports.getEditProductPage = (req,res,next)=>{
    const productId = req.params.productId;
    const product = Product.loadProduct(productId);
    res.render('admin/edit-product',{
        product: product,
        pageTitle: 'Edit Product',
        editProductCss:true

    });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.params.productId;
    const products = Product.fetchAll();
    const existingProductIndex = products.findIndex(p => p.id === productId);
    if (existingProductIndex !== -1) {
        const updatedProduct = new Product(
            req.body.title,
            req.body.imageUrl,
            req.body.description,
            req.body.price
        );
        updatedProduct.id = productId; // Set the ID of the updated product
        Product.updateProduct(productId, updatedProduct);
        
    
      
    }
    res.redirect('/admin/products');
};