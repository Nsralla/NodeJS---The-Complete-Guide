const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Order = sequelize.define('order',{
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    }
});

module.exports = Order;

// Order has a many to many relationship with product
// Order has a one to one relationship with user
// Order has a one to one relationship with cart
// Order has a many to many relationship with orderItem