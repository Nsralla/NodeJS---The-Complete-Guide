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




exports.getCart = (req, res, next) => {
    req.user.getCart()
        .then(cart => {
            if (!cart) {
                return res.status(404).render('404', {
                    pageTitle: 'Cart Not Found',
                    currentPage: 'error'
                });
            }
            return cart.getProducts({
                through: { attributes: ['quantity'] } // include quantity from CartItem
            });
        })
        .then(products => {
            if (products.length === 0) {
                return res.render('shop/cart', {
                    pageTitle: 'Your Cart',
                    products: [],
                    totalPrice: 0,
                    currentPage: 'cart',
                    cartCss: true
                });
            }

            const plainProducts = products.map(product => {
                const plain = product.toJSON();
                plain.quantity = product.cartItem.quantity;
                return plain;
            });

            const totalPrice = plainProducts.reduce((total, product) => {
                return total + product.price * product.quantity;
            }, 0);

            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                products: plainProducts,
                totalPrice: totalPrice,
                currentPage: 'cart',
                cartCss: true,
            });
        })
        .catch(err => {
            console.error('Error fetching cart:', err);
            res.status(500).render('500', {
                pageTitle: 'Error fetching cart',
                currentPage: 'error'
            });
        });
};


exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    let fetchedCart;
    let fetchedProduct;

    req.user.getCart()
        .then(cart => {
            if (!cart) {
                // Create a new cart if the user doesn't have one
                return Cart.create({ userId: req.user.id });
            }
            return cart;
        })
        .then(cart => {
            fetchedCart = cart;
            // Check if the product is already in the cart
            return cart.getProducts({ where: { id: productId } });
        })
        .then(products => {
            if (products.length > 0) {
                fetchedProduct = products[0];
                // Increment quantity
                const newQuantity = fetchedProduct.cartItem.quantity + 1;
                return fetchedProduct.cartItem.update({ quantity: newQuantity });
            } else {
                // If product is not in the cart, fetch it from the DB
                return Product.findByPk(productId);
            }
        })
        .then(product => {
            // If product was not in the cart before, add it with quantity 1
            if (product && !fetchedProduct) {
                return fetchedCart.addProduct(product, {
                    through: { quantity: 1 }
                });
            }
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            console.error('Error adding product to cart:', err);
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




exports.deleteProductFromCart = (req,res,next)=>{
    const id = req.params.productId;
    const cart = Cart.getCartInstance();
    cart.removeProductFromCart(id);
    res.redirect('/cart'); // Redirect to the cart page after deletion
};