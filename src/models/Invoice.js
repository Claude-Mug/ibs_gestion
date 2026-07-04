
// models/Invoice.js
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * Modèle Invoice (facture)
 * Correspond à la table 'invoices'
 */
const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'invoice_number'
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'client_id'
  },
  tvaRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 20.0,
    field: 'tva_rate'
  },
  status: {
    type: DataTypes.ENUM('payée', 'impayée', 'partielle'),
    allowNull: false,
    defaultValue: 'impayée'
  },
  paymentTerms: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Paiement sous 30 jours',
    field: 'payment_terms'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  signatureImagePath: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'signature_image_path'
  },
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0,
    field: 'amount_paid'
  },
  currencySymbol: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'CDF',
    field: 'currency_symbol'
  },
  invoiceDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'invoice_date'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'due_date'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'invoices',
  timestamps: false,
  underscored: true
});

// Getters virtuels pour les calculs agrégés (se basent sur les items chargés)
Object.defineProperties(Invoice.prototype, {
  subtotal: {
    get: function() {
      if (!this.Items) return 0;
      let sum = 0;
      for (const item of this.Items) {
        sum += item.subtotal;
      }
      return sum;
    }
  },
  tvaAmount: {
    get: function() {
      if (!this.Items) return 0;
      let sum = 0;
      for (const item of this.Items) {
        sum += item.tvaAmount;
      }
      return sum;
    }
  },
  total: {
    get: function() {
      return this.subtotal + this.tvaAmount;
    }
  },
  remaining: {
    get: function() {
      return this.total - (parseFloat(this.amountPaid) || 0);
    }
  }
});

module.exports = Invoice;