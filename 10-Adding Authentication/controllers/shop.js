const Product = require('../models/product'); // Import Product model
const Cart = require('../models/cart'); // Import Cart model
const Order = require('../models/order'); // Import Order model

exports.getShowProducts = (req, res, next) => { // get doesn't act like use, the url must match exactly
    // send products to the shop page
    Product.findAll()
        .then((products) => {
            const plainProducts = products.map(product => product.toJSON()); // Convert Sequelize instances to plain objects
            res.render('shop/product-list', {
                products: plainProducts,
                pageTitle: 'Shop',
                hasProducts: plainProducts.length > 0,
                productCss: true,
                formCss: 'add-product.css',
                currentPage: 'products',
                isAuthenticated: req.session.isLoggedIn
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

exports.getIndexPage = (req, res, next) => {
    const isAuthenticated = req.session.isLoggedIn === true; // === true ensures real boolean

    Product.findAll()
        .then((products) => {
            const plainProducts = products.map(product => product.toJSON());
            res.render('shop/index', {
                pageTitle: 'Home page',
                products: plainProducts,
                hasProducts: plainProducts.length > 0,
                currentPage: 'index',
                productCss: true,
                isAuthenticated // boolean true or false
            });
        })
        .catch(err => {
            console.error('Error fetching products:', err);
            res.status(500).render('500');
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
                    cartCss: true,
                    isAuthenticated: req.session.isLoggedIn
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
                isAuthenticated: req.session.isLoggedIn
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




exports.getCheckout = (req, res, next) => {
    Product.findAll()
        .then(products => {
            const plainProducts = products.map(product => product.toJSON()); // Convert Sequelize instances to plain objects
            res.render('shop/checkout', {
                pageTitle: 'Checkout',
                products: plainProducts,
                currentPage: 'checkout',
                hasProducts: plainProducts.length > 0,
                productCss: true,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => {
            console.log("error fetching products for checkout:", err);
            res.status(500).render('500', {
                pageTitle: 'Error',
                currentPage: 'error'
            });
        });

};




exports.getProductDetails = (req, res, next) => {
    const productId = req.params.productId;
    Product.findByPk(productId)
        .then((product) => {
            const plainProduct = product.toJSON();
            if (!product) {
                return res.status(404).render('404', {
                    pageTitle: 'Product Not Found',
                    currentPage: 'error'
                });
            }
            res.render('shop/product-details', {
                product: plainProduct,
                // @ts-ignore
                pageTitle: plainProduct.title,
                productDetailsCss: true,
                currentPage: 'product-details',
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => {
            console.error('Error loading product details:', err);
            res.status(500).render('500', {
                pageTitle: 'Error',
                currentPage: 'error'
            });
        });

};




exports.deleteProductFromCart = (req, res, next) => {
    const id = req.params.productId;
    req.user.getCart()
        .then(cart => {
            if (!cart) {
                return res.status(404).render('404', {
                    pageTitle: 'Cart Not Found',
                    currentPage: 'error'
                });
            }
            return cart.getProducts({ where: { id: id } });
        }).then(products => {
            const product = products[0];
            if (!product) {
                return res.status(404).render('404', {
                    pageTitle: 'Product Not Found',
                    currentPage: 'error',
                    isAuthenticated: req.isLoggedIn
                });
            }
            return product.cartItem.destroy(); // Remove the product from the cart
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            console.error('Error fetching cart:', err);
            res.status(500).render('500', {
                pageTitle: 'Error',
                currentPage: 'error'
            });
        });

};

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    let fetchedProducts;

    req.user.getCart()
        .then(cart => {
            if (!cart) {
                return res.status(404).render('404', {
                    pageTitle: 'Cart Not Found',
                    currentPage: 'error'
                });
            }
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            if (!products || products.length === 0) {
                return res.status(400).render('400', {
                    pageTitle: 'No Products in Cart',
                    currentPage: 'error'
                });
            }
            fetchedProducts = products;
            return req.user.createOrder(); // Sequelize auto-assigns userId
        })
        .then(order => {
            const addProductPromises = fetchedProducts.map(product => {
                return order.addProduct(product, {
                    through: { quantity: product.cartItem.quantity }
                });
            });
            return Promise.all(addProductPromises).then(() => order);
        })
        .then(() => {
            return fetchedCart.setProducts([]); // Clear the cart
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => {
            console.error('Error creating order:', err);
            res.status(500).render('500', {
                pageTitle: 'Error',
                currentPage: 'error'
            });
        });
};



exports.getOrders = (req, res, next) => {
    req.user.getOrders({
        include: ['products'] // Include associated products
    })
        .then(orders => {
            const plainOrders = orders.map(order => {
                const plainOrder = order.toJSON();
                // Process products to include quantity from OrderItem
                if (plainOrder.products) {
                    plainOrder.products = plainOrder.products.map(product => {
                        // The quantity is stored in the junction table (OrderItem)
                        product.quantity = product.orderItem.quantity;
                        return product;
                    });
                }
                return plainOrder;
            });

            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                currentPage: 'orders',
                orders: plainOrders,
                orderCss: true,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => {
            console.error('Error fetching orders:', err);
            res.status(500).render('500', {
                pageTitle: 'Error',
                currentPage: 'error'
            });
        });
};