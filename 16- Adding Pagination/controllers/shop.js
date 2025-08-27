const Product = require('../models/product'); // Import Product model
const Cart = require('../models/cart'); // Import Cart model
const Order = require('../models/order'); // Import Order model

const PRODUCTS_PER_PAGE = 2;
exports.getShowProducts = async (req, res, next) => { // get doesn't act like use, the url must match exactly
    
    // fetch all products for the current user
    const page = req.query.page ? parseInt(req.query.page) : 1;
    if(isNaN(page) || page < 1) page = 1;
    try{
        const totalProducts = await Product.findAndCountAll({
            offset: (page - 1) * PRODUCTS_PER_PAGE,
            limit: PRODUCTS_PER_PAGE,
            where: { userId: req.session.userId
            }});
        const plainProducts = totalProducts.rows.map(product => product.toJSON()); // Convert Sequelize instances to plain objects
        const totalPages = Math.ceil(totalProducts.count / PRODUCTS_PER_PAGE);  
        if(page > totalPages && totalPages > 0) page = totalPages; // if requested page exceeds total pages, set to last page

        res.render('shop/product-list', {
            products: plainProducts,
            pageTitle: 'Shop',
            hasProducts: plainProducts.length > 0,
            productCss: true,
            formCss: 'add-product.css',
            currentPage: 'products',
            isAuthenticated: req.session.isLoggedIn,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            previousPage: page > 1 ? page - 1 : null,
            lastPage: totalPages,
            currentPage: page
    });
    }catch(err){
        const error = new Error('AN ERROR OCCURED WHILE FETCHING PRODUCTS');
        error.originalMessage = err.message;
        error.statusCode = 500;
        return next(error);
    }
 }



exports.getIndexPage = async (req, res, next) => {

    let page = req.query.page ? parseInt(req.query.page) : 1;
    if(isNaN(page) || page < 1) page = 1;
    const isAuthenticated = req.session.isLoggedIn === true; // === true ensures real boolean

    try{
        // FETCH PRODUCTS AND THEIR COUNT
        const totalProducts = await Product.findAndCountAll({
             offset: (page - 1) * PRODUCTS_PER_PAGE,
            limit: PRODUCTS_PER_PAGE,
        });
        const totalPages = Math.ceil(totalProducts.count / PRODUCTS_PER_PAGE);
        if(page > totalPages && totalPages > 0) page = totalPages; // if requested page exceeds total pages, set to last page
 
      
        const plainProducts = totalProducts.rows.map(product => product.toJSON());
                res.render('shop/index', {
                    pageTitle: 'Home page',
                    products: plainProducts,
                    hasProducts: plainProducts.length > 0,
                    currentPage: 'index',
                    productCss: true,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    nextPage: page < totalPages ? page + 1 : null,
                    previousPage: page > 1 ? page - 1 : null,
                    lastPage: totalPages,
                    currentPage: page,
                    isAuthenticated // boolean true or false
                });

            }catch(err){
                const error = new Error('AN ERROR OCCURED WHILE FETCHING PRODUCTS');
                error.originalMessage = err.message;
                error.statusCode = 500;
            return next(error);
        }
}


exports.getCart = (req, res, next) => {
    req.user.getCart()
        .then(cart => {
            if (!cart) {
                return res.render('shop/cart', {
                    pageTitle: 'Your Cart',
                    currentPage: 'cart',
                    cartCss: true,
                    isAuthenticated: req.session.isLoggedIn,
                    isCartEmpty: true,
                    // csrfToken: req.csrfToken()
                });
            }
            return cart.getProducts({
                through: { attributes: ['quantity'] } // include quantity from CartItem
            });
        })
        .then(products => {
            if (!products)
                return null;
            if (products.length === 0) {
                return res.render('shop/cart', {
                    pageTitle: 'Your Cart',
                    products: [],
                    totalPrice: 0,
                    currentPage: 'cart',
                    cartCss: true,
                    isAuthenticated: req.session.isLoggedIn,
                    // csrfToken: req.csrfToken()
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
                isAuthenticated: req.session.isLoggedIn,
                // csrfToken: req.csrfToken()
            });
        })
        .catch(err => {
            const error = new Error('AN ERROR OCCURED WHILE FETCHING CART');
            error.originalMessage = err.message;
            error.statusCode = 500;
            return next(error);
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
            const error = new Error('AN ERROR OCCURED WHILE ADDING PRODUCT TO CART');
            error.originalMessage = err.message;
            error.statusCode = 500;
            return next(error);
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
            const error = new Error('AN ERROR OCCURED WHILE FETCHING PRODUCTS FOR CHECKOUT');
            error.originalMessage = err.message;
            error.statusCode = 500;
            return next(error);
        });

};




exports.getProductDetails = (req, res, next) => {
    const productId = req.params.productId;
    Product.findByPk(productId)
        .then((product) => {
            const plainProduct = product.toJSON();
            if (!product) {
                const error = new Error("Product not found");
                error.statusCode = 404; // Not Found
                return next(error);
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
            const error = new Error('AN ERROR OCCURED WHILE LOADING PRODUCT DETAILS');
            error.originalMessage = err.message;
            error.statusCode = 500;
            return next(error);
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
                const error = new Error("Product not found in the cart");
                error.statusCode = 404; // Not Found
                return next(error);
            }
            return product.cartItem.destroy(); // Remove the product from the cart
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error('AN ERROR OCCURED WHILE FETCHING CART');
            error.originalMessage = err.message;
            error.statusCode = 500;
            return next(error);
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
                const error = new Error("No Products Found In Cart ");
                error.statusCode = 400; // Bad Request
                return next(error);
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
            const error = new Error('AN ERROR OCCURED WHILE CREATING ORDER');
            error.originalMessage = err.message;
            error.statusCode = 500;
            return next(error);
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
            const error = new Error('AN ERROR OCCURED WHILE FETCHING ORDERS');
            error.originalMessage = err.message;
            error.statusCode = 500;
            return next(error);
        });
};

exports.viewInvoice = async (req, res, next) => {
    const orderId = req.params.orderId;
    const fs = require('fs');
    const path = require('path');
    const PDFDocument = require('pdfkit');
    const fsExtra = require('fs-extra');

    try {
        // 1. Verify order exists and belongs to the current user
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).render('404', {
                pageTitle: 'Order Not Found',
                currentPage: 'error'
            });
        }

        if (order.userId !== req.user.id) {
            return res.status(403).render('403', {
                pageTitle: 'Forbidden',
                currentPage: 'error'
            });
        }

        // 2. Ensure invoices directory exists
        const invoicesDir = path.join('data', 'invoices');
        fsExtra.ensureDirSync(invoicesDir);

        const invoiceName = `invoice-${orderId}.pdf`;
        const invoicePath = path.join(invoicesDir, invoiceName);

        // 3. If invoice already exists, stream it
        if (fs.existsSync(invoicePath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);
            return fs.createReadStream(invoicePath).pipe(res);
        }

        // 4. Fetch order with products
        const orders = await req.user.getOrders({
            where: { id: orderId },
            include: ['products']
        });

        if (!orders || orders.length === 0) {
            return res.status(404).render('404', {
                pageTitle: 'Order Not Found',
                currentPage: 'error'
            });
        }

        const fullOrder = orders[0].toJSON();

        if (fullOrder.products) {
            fullOrder.products = fullOrder.products.map(product => {
                product.quantity = product.orderItem.quantity;
                return product;
            });
        }

        // 5. Create PDF document
        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);

        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);

        pdfDoc.fontSize(26).text('Invoice', {
            underline: true,
            align: 'center'
        });

        pdfDoc.moveDown();
        pdfDoc.fontSize(14).text(`Order #: ${orderId}`);
        pdfDoc.moveDown();

        // Table header
        pdfDoc.fontSize(12);
        pdfDoc.text('Product', 50, pdfDoc.y, { width: 250, continued: true });
        pdfDoc.text('Quantity', 300, pdfDoc.y, { width: 80, continued: true });
        pdfDoc.text('Price', 380, pdfDoc.y, { width: 80, continued: true });
        pdfDoc.text('Total', 460, pdfDoc.y);

        pdfDoc.moveDown();
        let totalPrice = 0;

        // Products
        for (const product of fullOrder.products) {
            const productTotal = product.price * product.quantity;
            totalPrice += productTotal;

            pdfDoc.text(product.title, 50, pdfDoc.y, { width: 250, continued: true });
            pdfDoc.text(product.quantity.toString(), 300, pdfDoc.y, { width: 80, continued: true });
            pdfDoc.text(`$${product.price.toFixed(2)}`, 380, pdfDoc.y, { width: 80, continued: true });
            pdfDoc.text(`$${productTotal.toFixed(2)}`, 460, pdfDoc.y);
            pdfDoc.moveDown();
        }

        pdfDoc.moveDown();
        pdfDoc.fontSize(14).text(`Total Amount: $${totalPrice.toFixed(2)}`, { align: 'right' });

        pdfDoc.end();
    } catch (err) {
        const error = new Error('AN ERROR OCCURED WHILE GENERATING INVOICE');
        error.originalMessage = err.message;
        error.statusCode = 500;
        return next(error);
    }
};


exports.downloadInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    const fs = require('fs');
    const path = require('path');
    const PDFDocument = require('pdfkit');
    const fsExtra = require('fs-extra');

    // First, verify that the order exists and belongs to the current user
    Order.findByPk(orderId)
        .then(order => {
            if (!order) {
                return res.status(404).render('404', {
                    pageTitle: 'Order Not Found',
                    currentPage: 'error'
                });
            }
            if (order.userId !== req.user.id) {
                return res.status(403).render('403', {
                    pageTitle: 'Forbidden',
                    currentPage: 'error'
                });
            }

            // Order exists and belongs to current user, proceed with invoice generation
            // Ensure the invoices directory exists
            const invoicesDir = path.join('data', 'invoices');
            fsExtra.ensureDirSync(invoicesDir);

            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join(invoicesDir, invoiceName);

            // Check if invoice already exists
            if (fs.existsSync(invoicePath)) {
                // If it exists, serve the file
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');
                return fs.createReadStream(invoicePath).pipe(res);
            }

            // Invoice doesn't exist yet, generate it
            return req.user.getOrders({
                where: { id: orderId },
                include: ['products']
            })
                .then(orders => {
                    if (!orders || orders.length === 0) {
                        return res.status(404).render('404', {
                            pageTitle: 'Order Not Found',
                            currentPage: 'error'
                        });
                    }

                    const order = orders[0];
                    const plainOrder = order.toJSON();

                    // Process products to include quantity from OrderItem
                    if (plainOrder.products) {
                        plainOrder.products = plainOrder.products.map(product => {
                            product.quantity = product.orderItem.quantity;
                            return product;
                        });
                    }

                    // Create PDF document
                    const pdfDoc = new PDFDocument();
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');

                    pdfDoc.pipe(fs.createWriteStream(invoicePath));
                    pdfDoc.pipe(res);

                    // Add content to the PDF
                    pdfDoc.fontSize(26).text('Invoice', {
                        underline: true,
                        align: 'center'
                    });

                    pdfDoc.moveDown();
                    pdfDoc.fontSize(14).text('Order #: ' + orderId);
                    pdfDoc.moveDown();

                    // Add table header
                    pdfDoc.fontSize(12);
                    pdfDoc.text('Product', 50, pdfDoc.y, { width: 250, continued: true });
                    pdfDoc.text('Quantity', 300, pdfDoc.y, { width: 80, continued: true });
                    pdfDoc.text('Price', 380, pdfDoc.y, { width: 80, continued: true });
                    pdfDoc.text('Total', 460, pdfDoc.y);

                    pdfDoc.moveDown();
                    let totalPrice = 0;

                    // Add products
                    plainOrder.products.forEach(product => {
                        const productTotal = product.price * product.quantity;
                        totalPrice += productTotal;

                        pdfDoc.text(product.title, 50, pdfDoc.y, { width: 250, continued: true });
                        pdfDoc.text(product.quantity.toString(), 300, pdfDoc.y, { width: 80, continued: true });
                        pdfDoc.text('$' + product.price.toFixed(2), 380, pdfDoc.y, { width: 80, continued: true });
                        pdfDoc.text('$' + productTotal.toFixed(2), 460, pdfDoc.y);
                        pdfDoc.moveDown();
                    });

                    pdfDoc.moveDown();
                    pdfDoc.fontSize(14).text('Total Amount: $' + totalPrice.toFixed(2), { align: 'right' });

                    pdfDoc.end();
                })
                .catch(err => {
                    const error = new Error('AN ERROR OCCURED WHILE GENERATING INVOICE');
                    error.originalMessage = err.message;
                    error.statusCode = 500;
                    return next(error);
                });
        })
        .catch(err => {
            const error = new Error('AN ERROR OCCURED WHILE FETCHING ORDER');
            error.originalMessage = err.message;
            error.statusCode = 500;
            return next(error);
        });
};