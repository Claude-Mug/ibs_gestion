<<<<<<< HEAD
// models/Product.js
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * Modèle Product
 * Correspond à la table 'products'
 */
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price'
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'unité'
  },
  tvaRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 20.0,
    field: 'tva_rate'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'products',
  timestamps: false,
  underscored: true
});

=======
// models/Product.js
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * Modèle Product
 * Correspond à la table 'products'
 */
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price'
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'unité'
  },
  tvaRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 20.0,
    field: 'tva_rate'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'products',
  timestamps: false,
  underscored: true
});

>>>>>>> c90dfa826fa04030f95bdcd2433429c62d674c63
module.exports = Product;