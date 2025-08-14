
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
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).render('admin/add-product', {
            pageTitle: 'Add Product',
            formCss: 'add-product.css',
            currentPage: 'add-product',
            errorMessage: errors.array()[0].msg,
            oldInput:{
                title: req.body.title,
                imageUrl: req.body.imageUrl,
                description: req.body.description,
                price: req.body.price
            }
        });
    }
    req.user.createProduct({
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
        price: req.body.price,
        userId:req.user.id
    }).then((result) =>{
        res.redirect('/'); // Redirect to shop page after adding product
    })
    .catch(err=>{
        console.error('Error saving product:', err);
        res.status(500).render('500', {
            pageTitle: 'Error',
            currentPage: 'error'
        });
    });

//or

    // Product.create({
    //     title: req.body.title,
    //     imageUrl: req.body.imageUrl,
    //     description: req.body.description,
    //     price: req.body.price,
    //     userId:req.user.id
    // }) // this will create a new product in the database directly using Sequelize
    // .then((result) =>{
    //     // @ts-ignore
    //     console.log(`Product ${req.body.title} added successfully to the database`);
    //     console.log(result);
    //     res.redirect('/'); // Redirect to shop page after adding product
    // })
    // .catch(err=>{
    //     console.error('Error saving product:', err);
    //     res.status(500).render('500', {
    //         pageTitle: 'Error',
    //         currentPage: 'error'
    //     });
    // });
 
};

exports.getProducts = (req, res, next) => {
    Product.findAll({
        where:{
            userId:req.user.id
        }
    })
    .then((products) => {
        const plainProducts = products.map(product => product.toJSON()); // Convert Sequelize instances to plain objects
        res.render('admin/products', {
            products: plainProducts,
            pageTitle: 'Admin Products',
            hasProducts: plainProducts.length > 0,
            productCss: true,
            currentPage: 'admin-products',
    });
    })
    .catch(err=>{
        console.error('Error fetching products:', err);
        res.status(500).render('500', {
            pageTitle: 'Error',
            currentPage: 'error'
        });
    });
  
};

exports.postDeleteProduct = async (req,res,next)=>{
    try{
        const productId = req.params.productId; // Get the product title from the request parameters
        // find the user who added the product
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).render('404', {
                pageTitle: 'Product Not Found',
                currentPage: 'error'
            });
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
    catch(error){
        console.error('Error deleting product:', error);
        res.status(500).render('500',{
            pageTitle: 'Error',
            currentPage: 'error',
            errorMessage: 'An error occurred while deleting the product.'
        });
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
            return res.status(404).render('404', {
                pageTitle: 'Product Not Found',
                currentPage: 'error'
            });
        }
        const plainProduct = product.toJSON(); // Convert Sequelize instance to plain object
        res.render('admin/edit-product',{
        product: plainProduct,
        pageTitle: 'Edit Product',
        editProductCss:true,
    });
    })
    .catch(err=>{
        console.log('Error fetching product for editing:', err);
        res.status(500).render('500',{
            pageTitle: 'Error',
        });
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
        return res.status(404).render('404', {
            pageTitle: 'Product Not Found',
            currentPage: 'error'
        });
    }

    product.title = req.body.title; 
    product.imageUrl = req.body.imageUrl;
    product.description = req.body.description;
    product.price = req.body.price;

    await product.save();

    res.redirect('/admin/products');


    // Product.findOne({
    //     where:{
    //`         id: productId,
    //         userId:req.user.id
    //     }
    // })
    // .then((product)=>{
    //     if(!product) {
    //         return res.status(404).render('404', {
    //             pageTitle: 'Product Not Found',
    //             currentPage: 'error'
    //         });
    //     }
    //     product.title = req.body.title;
    //     product.imageUrl = req.body.imageUrl;
    //     product.description = req.body.description;
    //     product.price = req.body.price;
    //     return product.save(); // Save the updated product, it will return a promise, so we have to handle it inside then
    // })
    // .then(()=>{
    //     res.redirect('/admin/products');
    // })
    // .catch(err =>{ // catch will handle both findByPk and save errors
    //     console.error('Error fetching products:', err);
    //     res.status(500).render('500', {
    //         pageTitle: 'Error',
    //         currentPage: 'error',
    //         errorMessage: 'An error occurred while updating the product.'
    //     });
    // }); 
};