<<<<<<< HEAD
// models/InvoiceItem.js
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * Modèle InvoiceItem (ligne de facture)
 * Correspond à la table 'invoice_items'
 */
const InvoiceItem = sequelize.define('InvoiceItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  invoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'invoice_id'
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
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1.0
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
  }
}, {
  tableName: 'invoice_items',
  timestamps: false,
  underscored: true
});

// Getters virtuels pour les calculs
Object.defineProperties(InvoiceItem.prototype, {
  subtotal: {
    get: function() {
      const qty = parseFloat(this.quantity) || 0;
      const price = parseFloat(this.unitPrice) || 0;
      return qty * price;
    }
  },
  tvaAmount: {
    get: function() {
      const subtotal = this.subtotal;
      const rate = parseFloat(this.tvaRate) || 0;
      return subtotal * (rate / 100);
    }
  },
  total: {
    get: function() {
      return this.subtotal + this.tvaAmount;
    }
  }
});

=======
// models/InvoiceItem.js
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * Modèle InvoiceItem (ligne de facture)
 * Correspond à la table 'invoice_items'
 */
const InvoiceItem = sequelize.define('InvoiceItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  invoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'invoice_id'
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
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1.0
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
  }
}, {
  tableName: 'invoice_items',
  timestamps: false,
  underscored: true
});

// Getters virtuels pour les calculs
Object.defineProperties(InvoiceItem.prototype, {
  subtotal: {
    get: function() {
      const qty = parseFloat(this.quantity) || 0;
      const price = parseFloat(this.unitPrice) || 0;
      return qty * price;
    }
  },
  tvaAmount: {
    get: function() {
      const subtotal = this.subtotal;
      const rate = parseFloat(this.tvaRate) || 0;
      return subtotal * (rate / 100);
    }
  },
  total: {
    get: function() {
      return this.subtotal + this.tvaAmount;
    }
  }
});

>>>>>>> c90dfa826fa04030f95bdcd2433429c62d674c63
module.exports = InvoiceItem;