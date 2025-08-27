
const Product = require('../models/product'); // Import Product model
const validationResult = require('express-validator').validationResult; // Import validationResult from express-validator
exports.getAddProductPage = (req, res, next) => {
    if(! req.session.isLoggedIn){
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.render('admin/add-product',
         { pageTitle: 'Add Product',
            formCss: 'add-product.css',
            currentPage: 'add-product'
             }); // Render add-product view with a title and CSS
}
exports.postAddProduct = (req,res,next)=>{ // will only trigger on POST request
    const file = req.file;
    if(req.fileValidationError) {
        return res.status(422).render('admin/add-product',{
            pageTitle: 'Add Product',
            formCss: 'add-product.css',
            currentPage: 'add-product',
            errorMessage: req.fileValidationError,
            oldInput:{
                title: req.body.title,
                imageUrl: file ? file.path : '',
                description: req.body.description,
                price: req.body.price
            }
        });
    }
    console.log("FILE SUBMITTED: ", file);
    const errors = validationResult(req);
    console.log(errors);
    if(!errors.isEmpty()) {
        return res.status(400).render('admin/add-product', {
            pageTitle: 'Add Product',
            formCss: 'add-product.css',
            currentPage: 'add-product',
            errorMessage: errors.array()[0].msg + " for " + errors.array()[0].param,
            oldInput:{
                title: req.body.title,
                imageUrl: file ? file.filename : '', // Use the file path from multer
                description: req.body.description,
                price: req.body.price
            }
        });
    }
    const imageUrl = file? file.filename : ''; // Use the file path from multer
    req.user.createProduct({
        title: req.body.title,
        imageUrl: imageUrl,
        description: req.body.description,
        price: req.body.price,
        userId:req.user.id
    }).then((result) => {
        res.redirect('/'); // Redirect to shop page after adding product
    })
    .catch(err=>{
       const error = new Error(`AN ERROR OCCURED WHILE ADDING A PRODUCT TO DB`);
       error.originalMessage = err.message;
       error.httpStatusCode = 500;
       return next(error);
    });

 
};

exports.getProducts = (req, res, next) => {
    Product.findAll({
        where:{
            userId:req.user.id
        }
    })
    .then((products) => {
        const plainProducts = products.map(product => product.toJSON()); // Convert Sequelize instances to plain objects
        console.log("plain products:", plainProducts);
        res.render('admin/products', {
            products: plainProducts,
            pageTitle: 'Admin Products',
            hasProducts: plainProducts.length > 0,
            productCss: true,
            currentPage: 'admin-products',
    });
    })
    .catch(err=>{
        const error = new Error('AN ERROR OCCURED WHILE FETCHING PRODUCTS');
        error.originalMessage = err.message;
        error.httpStatusCode = 500;
        return next(error);
    });
  
};

exports.postDeleteProduct = async (req,res,next)=>{
    try{
        const productId = req.params.productId; // Get the product title from the request parameters
        // find the user who added the product
        const product = await Product.findByPk(productId);
        if (!product) {
            const error = new Error("Product not found");
            error.statusCode = 404; // Not Found
            return next(error);
        }

        const userId = product.userId; // Get the userId from the product
        if(userId !== req.user.id) {
            return res.status(403).render('403', {
                pageTitle: 'Forbidden',
                currentPage: 'error'
            });
        }
        await Product.destroy({
            where:{
                id:productId
            }
        });
        
        res.redirect('/admin/products'); // Redirect to admin products page after deletion
    }
    catch(err){
        const error = new Error('AN ERROR OCCURED WHILE DELETING THE PRODUCT');
        error.httpStatusCode = 500;
        error.originalMessage = err.message;
        return next(error);
    }
  
}

exports.getEditProductPage = (req,res,next)=>{
    const productId = req.params.productId;
    Product.findOne({
        where:{
            id:productId,
            userId:req.user.id
        }
    })
    .then((product)=>{
        if(!product) {
            const error = new Error("Product not found");
            error.statusCode = 404; // Not Found
            return next(error);
        }
        const plainProduct = product.toJSON(); // Convert Sequelize instance to plain object
        res.render('admin/edit-product',{
        product: plainProduct,
        pageTitle: 'Edit Product',
        editProductCss:true,
    });
    })
    .catch(err=>{
        const error = new Error('AN ERROR OCCURED WHILE FETCHING THE PRODUCT FOR EDITING');
        error.httpStatusCode = 500;
        error.originalMessage = err.message;
        return next(error);
    });
};





exports.postEditProduct = async (req, res, next) => {
    const productId = req.params.productId;
    const product = await Product.findByPk(productId);
    const userId = product.userId; // Get the userId from the product
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            currentPage: 'admin-products',
            oldInput: {
                title: req.body.title,
                imageUrl: req.body.imageUrl,
                description: req.body.description,
                price: req.body.price
            },
            validationErrors: errors.array()[0].msg
        });
    }
    if(userId !== req.user.id){
        return res.status(403).render('403', {
            pageTitle: 'Forbidden',
            currentPage: 'error'
        });
    }

    if (!product) {
        const error = new Error("Product not found");
        error.statusCode = 404; // Not Found
        return next(error); 
    }
    const imageUrl = req.file ? req.file.filename : product.imageUrl; // Use the file path from multer or keep the existing image URL

    product.title = req.body.title; 
    product.imageUrl = imageUrl;
    product.description = req.body.description;
    product.price = req.body.price;

    await product.save();

    res.redirect('/admin/products');



};