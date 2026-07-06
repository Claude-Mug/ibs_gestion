
// models/index.js
const { sequelize } = require('../config/database');

// models/index.js - Point d'entrée pour les associations
const Client = require('./Client');
const Product = require('./Product');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');

// Associations
// Un Client peut avoir plusieurs Invoices
Client.hasMany(Invoice, {
  foreignKey: 'client_id',
  as: 'Invoices'
});

// Une Invoice appartient à un Client
Invoice.belongsTo(Client, {
  foreignKey: 'client_id',
  as: 'Client'
});

// Une Invoice a plusieurs InvoiceItems
Invoice.hasMany(InvoiceItem, {
  foreignKey: 'invoice_id',
  as: 'Items',
  onDelete: 'CASCADE'
});

// Un InvoiceItem appartient à une Invoice
InvoiceItem.belongsTo(Invoice, {
  foreignKey: 'invoice_id',
  as: 'Invoice'
});

// (Optionnel) Un InvoiceItem pourrait être lié à un Product, mais ce n'est pas requis

module.exports = {
  sequelize,
  Client,
  Product,
  Invoice,
  InvoiceItem

};
