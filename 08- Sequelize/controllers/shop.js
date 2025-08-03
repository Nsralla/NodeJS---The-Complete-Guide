const Product = require('../models/product'); // Import Product model
const Cart = require('../models/cart'); // Import Cart model


exports.getShowProducts = (req, res, next) => { // get doesn't act like use, the url must match exactly
    // send products to the shop page
    Product.findAll()
    .then((products)=>{
        const plainProducts = products.map(product => product.toJSON()); // Convert Sequelize instances to plain objects
        res.render('shop/product-list',{
            products: plainProducts,
            pageTitle: 'Shop',
            hasProducts: plainProducts.length > 0,
            productCss:true,
            formCss: 'add-product.css',
            currentPage: 'products'
        });
    })
    .catch(err => {
        console.error('Error fetching products:', err);
        res.status(500).render('500', {
            pageTitle: 'Error',
            currentPage: 'error'
        });
    });
};


exports.getIndexPage = (req,res,next)=>{
    Product.findAll()
    .then((products) =>{
        const plainProducts = products.map(product => product.toJSON()); // Convert Sequelize instances to plain objects
        res.render('shop/index',{
            pageTitle: 'Home page',
            products: plainProducts,
            hasProducts: plainProducts.length > 0,
            currentPage:'index',
            productCss:true

        })
    })
    .catch(err =>{
        console.error('Error fetching products:', err);
        res.status(500).render('500', {
            pageTitle: 'Error',
            currentPage: 'error'
        });
    });
    
};




exports.getCart = (req,res,next)=>{
    const cart = Cart.getCartInstance();
    res.render('shop/cart',{ 
        pageTitle:'Your Cart',
        products: cart.products,
        totalPrice: cart.totalPrice,
        currentPage:'cart',
        cartCss: true,
    });

};

exports.postCart = (req,res,next)=>{
    const productId =req.body.productId; // Get the product ID from the request body
    Product.findByPk(productId)
    .then((product)=>{
        if(!product) {
            return res.status(404).render('404', {
                pageTitle: 'Product Not Found',
                currentPage: 'error'
            });
        }
        const plainProduct = product.toJSON();
        const cart = Cart.getCartInstance();
        cart.addProductToCart(plainProduct); // Add product to cart
        res.redirect('/cart'); // Redirect to the cart page after adding product
    })
    .catch(err=>{
        console.error('Error loading product for cart:', err);
        res.status(500).render('500', {
            pageTitle: 'Error',
            currentPage: 'error'
        });
    });
};




exports.getCheckout = (req,res,next)=>{
    Product.findAll()
    .then(products=>{
        const plainProducts = products.map(product => product.toJSON()); // Convert Sequelize instances to plain objects
        res.render('shop/checkout',{
            pageTitle: 'Checkout',
            products: plainProducts,
            currentPage: 'checkout',
            hasProducts: plainProducts.length > 0,
            productCss: true
        });
    })
    .catch(err=>{
        console.log("error fetching products for checkout:", err);
        res.status(500).render('500', {
            pageTitle: 'Error',
            currentPage: 'error'
        });
    });

};

exports.getOrders = (req,res,next)=>{
    res.render('shop/orders',{
        pageTitle: 'Your Orders',
        currentPage: 'orders'
    });
};



exports.getProductDetails = (req, res, next) => {
        const productId = req.params.productId;
        Product.findByPk(productId)
        .then((product)=>{
            const plainProduct = product.toJSON();
            if(!product) {
                return res.status(404).render('404', {
                    pageTitle: 'Product Not Found',
                    currentPage: 'error'
                });
            }
            res.render('shop/product-details',{
                product: plainProduct,
                // @ts-ignore
                pageTitle: plainProduct.title,
                productDetailsCss: true,
                currentPage: 'product-details'
            }); 
        })
        .catch(err=>{
            console.error('Error loading product details:', err);
            res.status(500).render('500', {
                pageTitle: 'Error',
                currentPage: 'error'
            });
        });

};


// exports.deleteProduct = (req,res,next)=>{
//     const id = req.params.productId;
//     Product.delete(id);
//     res.redirect('/products'); // Redirect to the products page after deletion
// };


exports.deleteProductFromCart = (req,res,next)=>{
    const id = req.params.productId;
    const cart = Cart.getCartInstance();
    cart.removeProductFromCart(id);
    res.redirect('/cart'); // Redirect to the cart page after deletion
};