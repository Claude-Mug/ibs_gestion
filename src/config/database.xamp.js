<<<<<<< HEAD
// config/database.js
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Chargement des variables d'environnement
dotenv.config();

/**
 * Connexion à la base de données PostgreSQL
 * Utilise les variables du fichier .env
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Nom de la base
  process.env.DB_USER,      // Utilisateur
  process.env.DB_PASSWORD,  // Mot de passe
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 16353,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: false, // On gère manuellement created_at
      underscored: true  // Utilise snake_case pour les colonnes
    }
  }
);

// Fonction pour tester la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie !');
    console.log(`📊 Base: ${process.env.DB_NAME} sur ${process.env.DB_HOST}`);
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données :');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
};

// Synchronisation des modèles avec la base (optionnelle)
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ alter: true, force });
    console.log('✅ Modèles synchronisés avec la base de données');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation :', error.message);
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
=======
// config/database.js
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Chargement des variables d'environnement
dotenv.config();

/**
 * Connexion à la base de données PostgreSQL
 * Utilise les variables du fichier .env
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Nom de la base
  process.env.DB_USER,      // Utilisateur
  process.env.DB_PASSWORD,  // Mot de passe
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 16353,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: false, // On gère manuellement created_at
      underscored: true  // Utilise snake_case pour les colonnes
    }
  }
);

// Fonction pour tester la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie !');
    console.log(`📊 Base: ${process.env.DB_NAME} sur ${process.env.DB_HOST}`);
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données :');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
};

// Synchronisation des modèles avec la base (optionnelle)
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ alter: true, force });
    console.log('✅ Modèles synchronisés avec la base de données');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation :', error.message);
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
>>>>>>> c90dfa826fa04030f95bdcd2433429c62d674c63
};