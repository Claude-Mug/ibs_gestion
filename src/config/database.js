
// config/database.js
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Connexion à la base de données PostgreSQL (Aiven)
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
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
      timestamps: false,
      underscored: true
    },
    // ✅ SSL requis par Aiven
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL (Aiven) réussie !');
    console.log(`📊 Base: ${process.env.DB_NAME} sur ${process.env.DB_HOST}`);
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base :');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
};

const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ alter: true, force });
    console.log('✅ Modèles synchronisés');
  } catch (error) {
    console.error('❌ Erreur synchronisation :', error.message);
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};