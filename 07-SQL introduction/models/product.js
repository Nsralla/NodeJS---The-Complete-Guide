const products = [];
const db = require('../util/database'); // Assuming you have a database utility for database operations
class Product {
    constructor(title, imageUrl, description, price) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save(){
        return db.execute(`INSERT INTO products (title, imageUrl, description, price) values(?,?,?,?)`, [this.title, this.imageUrl, this.description, this.price])
    }

    static updateProduct(id, updatedProduct) {
        const productIndex = products.findIndex(p => p.id === id);
        if (productIndex !== -1) {
            products[productIndex] = updatedProduct; // Update the product in the array
        }
    }
    static delete(id){
        const productIndex = products.findIndex(p => p.id === id);
        if (productIndex !== -1) {
            products.splice(productIndex, 1);
        }

    }
    static loadProduct(id){
        // return products.find(p => p.id === id);
       return db.execute(`SELECT * FROM products where id = ?`,[id])
        .then(result=>{
           return result;
        })
        .catch(err=>{
            console.error('Error loading product:', err);
            throw err; // Propagate the error
        });
    }

    static fetchAll(){
        return db.execute('SELECT * FROM products')
        .then(result=>{
            return result;
        })
        .catch(err=>{
            console.error('Error fetching products:', err);
            throw err; // Propagate the error
        });
    }

};

module.exports = Product; // exports the class itself, not an instance
//exports.ProductObj = Product; // exports an object with a property Product, so to access it you would say: const Product = require('./product').Product;