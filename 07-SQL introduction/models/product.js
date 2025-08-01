const products = [];

class Product {
    constructor(title, imageUrl, description, price) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save(){
        this.id = Math.random().toString(); // Generate a random ID for the product
        products.push(this);
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
        return products.find(p => p.id === id);
    }

    static fetchAll(){
        return products;
    }

};

module.exports = Product; // exports the class itself, not an instance
//exports.ProductObj = Product; // exports an object with a property Product, so to access it you would say: const Product = require('./product').Product;