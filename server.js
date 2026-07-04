// server.js - Point d'entrée du serveur optimisé
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const os = require('os');
const compression = require('compression');
const helmet = require('helmet');

dotenv.config();

const { sequelize, testConnection } = require('./src/config/database');
const routes = require('./src/routes');
const { errorHandler, notFoundHandler } = require('./src/middlewares/errorHandler');

const app = express();

// ============================================================
// 1. Middlewares
// ============================================================

app.use(compression({
  threshold: 1024,
  level: 6
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms) ${statusColor}`);
  });
  next();
});

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
  maxAge: 86400
}));

app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      res.status(400).json({ error: 'JSON invalide' });
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================================
// 2. Routes
// ============================================================

app.get('/health', async (req, res) => {
  let dbStatus = 'OK';
  let dbDetails = {};
  
  try {
    await sequelize.authenticate();
    
    try {
      const [versionResult] = await sequelize.query('SELECT version()');
      dbDetails.postgresVersion = versionResult[0].version.split(',')[0];
      
      const [sizeResult] = await sequelize.query(
        `SELECT pg_database_size(current_database()) / 1024 / 1024 AS size_mb`
      );
      dbDetails.sizeMB = parseFloat(sizeResult[0].size_mb).toFixed(2);
      
      const [connResult] = await sequelize.query(
        `SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database()`
      );
      dbDetails.activeConnections = parseInt(connResult[0].count);
      
      const [tablesResult] = await sequelize.query(
        `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'`
      );
      dbDetails.tableCount = parseInt(tablesResult[0].count);
      
    } catch (e) {
      dbDetails.error = 'Impossible de récupérer les stats DB';
    }
    
  } catch (e) {
    dbStatus = 'FAILED';
    dbDetails.error = e.message;
  }

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      name: process.env.DB_NAME,
      host: process.env.DB_HOST,
      ...dbDetails
    },
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API IBS Services v1.0.0',
    endpoints: {
      clients: '/api/clients',
      products: '/api/products',
      invoices: '/api/invoices',
      stats: '/api/stats/dashboard',
      importExport: {
        base: '/api/import-export',
        endpoints: {
          exportAll: 'GET /export/all',
          exportOne: 'GET /export/:id',
          importOne: 'POST /import',
          importBatch: 'POST /import/batch'
        }
      }
    }
  });
});

app.use('/api', routes);

// ============================================================
// 3. Gestion des erreurs
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: {
      '/api/clients': 'Gestion des clients',
      '/api/products': 'Gestion des produits',
      '/api/invoices': 'Gestion des factures',
      '/api/stats/dashboard': 'Statistiques',
      '/api/import-export': 'Import/Export des factures'
    }
  });
});

app.use(errorHandler);

// ============================================================
// 4. Fonctions utilitaires
// ============================================================

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({
          interface: name,
          address: iface.address
        });
      }
    }
  }
  return ips;
}

async function getDbStats() {
  try {
    const [versionResult] = await sequelize.query('SELECT version()');
    const version = versionResult[0].version;
    console.log(`📌 PostgreSQL Version: ${version.split(',')[0]}`);
    
    const [tablesResult] = await sequelize.query(
      `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'`
    );
    const tableCount = parseInt(tablesResult[0].count);
    console.log(`📊 Tables: ${tableCount}`);
    
    const [sizeResult] = await sequelize.query(
      `SELECT pg_database_size(current_database()) / 1024 / 1024 AS size_mb`
    );
    const sizeMB = parseFloat(sizeResult[0].size_mb).toFixed(2);
    console.log(`💾 Taille DB: ${sizeMB} MB`);
    
    const [connResult] = await sequelize.query(
      `SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database()`
    );
    const activeConns = parseInt(connResult[0].count);
    console.log(`🔗 Connexions actives: ${activeConns}`);
    
  } catch (e) {
    console.log('⚠️ Impossible de récupérer les stats DB');
  }
}

function displayBanner() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🚀 IBS Services API Server');
  console.log(`📦 Version: 1.0.0`);
  console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Base: ${process.env.DB_NAME} sur ${process.env.DB_HOST}`);
  console.log(`⚙️ Port: ${PORT}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('🌐 Accès local :');
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://127.0.0.1:${PORT}`);
  
  const ips = getLocalIPs();
  if (ips.length > 0) {
    console.log('📱 Accès réseau (même Wi-Fi) :');
    ips.forEach(ip => {
      console.log(`   http://${ip.address}:${PORT}`);
    });
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('📌 Points de terminaison :');
  console.log(`   /health → Vérification de l'état du serveur`);
  console.log(`   /api → Liste des endpoints disponibles`);
  console.log(`   /api/clients → Gestion des clients`);
  console.log(`   /api/products → Gestion des produits`);
  console.log(`   /api/invoices → Gestion des factures`);
  console.log(`   /api/import-export → Import/Export des factures`);
  console.log('═══════════════════════════════════════════════════════');
  
  // Récupérer les stats en arrière-plan (ne bloque pas)
  getDbStats();
}

// ============================================================
// 5. Démarrage du serveur
// ============================================================

const PORT = process.env.PORT || 3000;
const START_TIME = Date.now();

const startServer = async () => {
  console.log('🔄 Initialisation du serveur...');

  try {
    await testConnection();
    console.log('✅ Connexion à la base de données établie');

    app.listen(PORT, '0.0.0.0', () => {
      const uptime = ((Date.now() - START_TIME) / 1000).toFixed(2);
      console.log(`✅ Serveur démarré en ${uptime}s`);
      displayBanner();
    });

  } catch (error) {
    console.error('❌ Erreur au démarrage :', error.message);
    process.exit(1);
  }
};

process.on('uncaughtException', (error) => {
  console.error('💥 Erreur non capturée :', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Rejet non géré :', reason);
});

const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Signal ${signal} reçu. Arrêt du serveur...`);
  try {
    await sequelize.close();
    console.log('✅ Connexion à la base fermée');
  } catch (err) {
    console.error('❌ Erreur fermeture base :', err);
  }
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();

=======
// server.js - Point d'entrée du serveur optimisé
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const os = require('os');
const compression = require('compression');
const helmet = require('helmet');

dotenv.config();

const { sequelize, testConnection } = require('./src/config/database');
const routes = require('./src/routes');
const { errorHandler, notFoundHandler } = require('./src/middlewares/errorHandler');

const app = express();

// ============================================================
// 1. Middlewares
// ============================================================

app.use(compression({
  threshold: 1024,
  level: 6
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms) ${statusColor}`);
  });
  next();
});

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
  maxAge: 86400
}));

app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      res.status(400).json({ error: 'JSON invalide' });
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================================
// 2. Routes
// ============================================================

app.get('/health', async (req, res) => {
  let dbStatus = 'OK';
  let dbDetails = {};
  
  try {
    await sequelize.authenticate();
    
    try {
      const [versionResult] = await sequelize.query('SELECT version()');
      dbDetails.postgresVersion = versionResult[0].version.split(',')[0];
      
      const [sizeResult] = await sequelize.query(
        `SELECT pg_database_size(current_database()) / 1024 / 1024 AS size_mb`
      );
      dbDetails.sizeMB = parseFloat(sizeResult[0].size_mb).toFixed(2);
      
      const [connResult] = await sequelize.query(
        `SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database()`
      );
      dbDetails.activeConnections = parseInt(connResult[0].count);
      
      const [tablesResult] = await sequelize.query(
        `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'`
      );
      dbDetails.tableCount = parseInt(tablesResult[0].count);
      
    } catch (e) {
      dbDetails.error = 'Impossible de récupérer les stats DB';
    }
    
  } catch (e) {
    dbStatus = 'FAILED';
    dbDetails.error = e.message;
  }

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      name: process.env.DB_NAME,
      host: process.env.DB_HOST,
      ...dbDetails
    },
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API IBS Services v1.0.0',
    endpoints: {
      clients: '/api/clients',
      products: '/api/products',
      invoices: '/api/invoices',
      stats: '/api/stats/dashboard',
      importExport: {
        base: '/api/import-export',
        endpoints: {
          exportAll: 'GET /export/all',
          exportOne: 'GET /export/:id',
          importOne: 'POST /import',
          importBatch: 'POST /import/batch'
        }
      }
    }
  });
});

app.use('/api', routes);

// ============================================================
// 3. Gestion des erreurs
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: {
      '/api/clients': 'Gestion des clients',
      '/api/products': 'Gestion des produits',
      '/api/invoices': 'Gestion des factures',
      '/api/stats/dashboard': 'Statistiques',
      '/api/import-export': 'Import/Export des factures'
    }
  });
});

app.use(errorHandler);

// ============================================================
// 4. Fonctions utilitaires
// ============================================================

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({
          interface: name,
          address: iface.address
        });
      }
    }
  }
  return ips;
}

async function getDbStats() {
  try {
    const [versionResult] = await sequelize.query('SELECT version()');
    const version = versionResult[0].version;
    console.log(`📌 PostgreSQL Version: ${version.split(',')[0]}`);
    
    const [tablesResult] = await sequelize.query(
      `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'`
    );
    const tableCount = parseInt(tablesResult[0].count);
    console.log(`📊 Tables: ${tableCount}`);
    
    const [sizeResult] = await sequelize.query(
      `SELECT pg_database_size(current_database()) / 1024 / 1024 AS size_mb`
    );
    const sizeMB = parseFloat(sizeResult[0].size_mb).toFixed(2);
    console.log(`💾 Taille DB: ${sizeMB} MB`);
    
    const [connResult] = await sequelize.query(
      `SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database()`
    );
    const activeConns = parseInt(connResult[0].count);
    console.log(`🔗 Connexions actives: ${activeConns}`);
    
  } catch (e) {
    console.log('⚠️ Impossible de récupérer les stats DB');
  }
}

function displayBanner() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🚀 IBS Services API Server');
  console.log(`📦 Version: 1.0.0`);
  console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Base: ${process.env.DB_NAME} sur ${process.env.DB_HOST}`);
  console.log(`⚙️ Port: ${PORT}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('🌐 Accès local :');
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://127.0.0.1:${PORT}`);
  
  const ips = getLocalIPs();
  if (ips.length > 0) {
    console.log('📱 Accès réseau (même Wi-Fi) :');
    ips.forEach(ip => {
      console.log(`   http://${ip.address}:${PORT}`);
    });
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('📌 Points de terminaison :');
  console.log(`   /health → Vérification de l'état du serveur`);
  console.log(`   /api → Liste des endpoints disponibles`);
  console.log(`   /api/clients → Gestion des clients`);
  console.log(`   /api/products → Gestion des produits`);
  console.log(`   /api/invoices → Gestion des factures`);
  console.log(`   /api/import-export → Import/Export des factures`);
  console.log('═══════════════════════════════════════════════════════');
  
  // Récupérer les stats en arrière-plan (ne bloque pas)
  getDbStats();
}

// ============================================================
// 5. Démarrage du serveur
// ============================================================

const PORT = process.env.PORT || 3000;
const START_TIME = Date.now();

const startServer = async () => {
  console.log('🔄 Initialisation du serveur...');

  try {
    await testConnection();
    console.log('✅ Connexion à la base de données établie');

    app.listen(PORT, '0.0.0.0', () => {
      const uptime = ((Date.now() - START_TIME) / 1000).toFixed(2);
      console.log(`✅ Serveur démarré en ${uptime}s`);
      displayBanner();
    });

  } catch (error) {
    console.error('❌ Erreur au démarrage :', error.message);
    process.exit(1);
  }
};

process.on('uncaughtException', (error) => {
  console.error('💥 Erreur non capturée :', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Rejet non géré :', reason);
});

const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Signal ${signal} reçu. Arrêt du serveur...`);
  try {
    await sequelize.close();
    console.log('✅ Connexion à la base fermée');
  } catch (err) {
    console.error('❌ Erreur fermeture base :', err);
  }
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();

>>>>>>> c90dfa826fa04030f95bdcd2433429c62d674c63
module.exports = app;
