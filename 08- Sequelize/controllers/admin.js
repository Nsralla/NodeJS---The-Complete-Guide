
const Product = require('../models/product'); // Import Product model

exports.getAddProductPage = (req, res, next) => {
    res.render('admin/add-product',
         { pageTitle: 'Add Product',
            formCss: 'add-product.css',
            currentPage: 'add-product' }); // Render add-product view with a title and CSS
}
exports.postAddProduct = (req,res,next)=>{ // will only trigger on POST request
    Product.create({
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
        price: req.body.price
    }) // this will create a new product in the database directly using Sequelize
    .then((result) =>{
        // @ts-ignore
        console.log(`Product ${req.body.title} added successfully to the database`);
        console.log(result);
        res.redirect('/'); // Redirect to shop page after adding product
    })
    .catch(err=>{
        console.error('Error saving product:', err);
        res.status(500).render('500', {
            pageTitle: 'Error',
            currentPage: 'error'
        });
    });
 
};

exports.getProducts = (req, res, next) => {
    Product.findAll()
    .then((products) => {
        const plainProducts = products.map(product => product.toJSON()); // Convert Sequelize instances to plain objects
        res.render('admin/products', {
            products: plainProducts,
            pageTitle: 'Admin Products',
            hasProducts: plainProducts.length > 0,
            productCss: true,
            currentPage: 'admin-products'
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

exports.postDeleteProduct = (req,res,next)=>{
    const productId = req.params.productId; // Get the product title from the request parameters
    Product.delete(productId);
    res.redirect('/admin/products'); // Redirect to the admin products page after deletion
    
}

exports.getEditProductPage = (req,res,next)=>{
    const productId = req.params.productId;
    Product.findByPk(productId)
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
        editProductCss:true
    });
    })
    .catch(err=>{
        console.log('Error fetching product for editing:', err);
        res.status(500).render('500',{
            pageTitle: 'Error',
        });
    });
};





exports.postEditProduct = (req, res, next) => {
    const productId = req.params.productId;
    // const products = Product.fetchAll();
    Product.findByPk(productId)
    .then((product)=>{
        if(!product) {
            return res.status(404).render('404', {
                pageTitle: 'Product Not Found',
                currentPage: 'error'
            });
        }
        // @ts-ignore
        product.title = req.body.title;
         // @ts-ignore
        product.imageUrl = req.body.imageUrl;
         // @ts-ignore
        product.description = req.body.description;
         // @ts-ignore
        product.price = req.body.price;
        return product.save(); // Save the updated product
    })
    .then(()=>{
        res.redirect('/admin/products');
    })
    .catch(err =>{ // catch will handle both findByPk and save errors
        console.error('Error fetching products:', err);
        res.status(500).render('500', {
            pageTitle: 'Error',
            currentPage: 'error',
            errorMessage: 'An error occurred while updating the product.'
        });
    }); 
};