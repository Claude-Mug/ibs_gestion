 
// models/Client.js
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

/**
 * Modèle Client
 * Correspond à la table 'clients'
 */
const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tva_number: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'tva_number' // correspond au nom de colonne en base
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'clients',
  timestamps: false, // on gère manuellement created_at
  underscored: true // utilise snake_case pour les noms de colonnes automatiques
});

// Getter virtuel pour le nom d'affichage (displayName)
Client.prototype.getDisplayName = function() {
  return this.company && this.company.trim().length > 0 ? this.company : this.name;
};

module.exports = Client;