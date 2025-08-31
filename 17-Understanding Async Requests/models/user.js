const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('user',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password:{
        type: Sequelize.STRING,
        allowNull: false
    },
    userToken:{
        type: Sequelize.STRING,
        allowNull: true
    },
    userTokenExpiration:{
        type: Sequelize.DATE,
        allowNull: true
    }
});

module.exports = User;