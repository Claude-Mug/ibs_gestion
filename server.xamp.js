<<<<<<< HEAD
// server.js - Point d'entrée du serveur optimisé
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const os = require('os');
const compression = require('compression'); // Compression GZIP
const helmet = require('helmet'); // Sécurité

// Chargement des variables d'environnement
dotenv.config();

// Import des modules
const { sequelize, testConnection } = require('./src/config/database');
const routes = require('./src/routes');
const { errorHandler, notFoundHandler } = require('./src/middlewares/errorHandler');
const { logger } = require('./src/middlewares/logger');

const app = express();

// ============================================================
// 1. Middlewares de sécurité et performance
// ============================================================

// Compression GZIP pour réduire la taille des réponses
app.use(compression({
  threshold: 1024, // Compresser les réponses > 1KB
  level: 6 // Niveau de compression (1-9)
}));

// Sécurité : protection contre les attaques courantes
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Autoriser les requêtes CORS spécifiques si besoin
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

// Logger des requêtes avec plus d'informations
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms) ${statusColor}`);
  });
  next();
});

// CORS optimisé
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
  maxAge: 86400 // Cache des pré-requêtes CORS (24h)
}));

// Parser JSON avec validation de taille
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

// Route de santé avec plus d'informations
app.get('/health', async (req, res) => {
  let dbStatus = 'OK';
  try {
    await sequelize.authenticate();
  } catch (e) {
    dbStatus = 'FAILED';
  }

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// Route racine API avec liste des endpoints
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

// Routes API
app.use('/api', routes);

// ============================================================
// 3. Gestion des erreurs
// ============================================================

// Route 404 avec message détaillé
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

// Gestionnaire d'erreurs global
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
  console.log('═══════════════════════════════════════════════════════\n');
}

// ============================================================
// 5. Démarrage du serveur
// ============================================================

const PORT = process.env.PORT || 3000;
const START_TIME = Date.now();

const startServer = async () => {
  console.log('🔄 Initialisation du serveur...');

  try {
    // Test de connexion
    await testConnection();
    console.log('✅ Connexion à la base de données établie');

    // Démarrage du serveur
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

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('💥 Erreur non capturée :', error);
  console.error('⚠️ Le serveur continue de fonctionner, mais une erreur critique est survenue.');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Rejet non géré :', reason);
});

// Gestion des signaux d'arrêt
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Signal ${signal} reçu. Arrêt du serveur...`);
  
  // Fermeture de la base de données
  try {
    await sequelize.close();
    console.log('✅ Connexion à la base fermée');
  } catch (err) {
    console.error('❌ Erreur lors de la fermeture de la base :', err);
  }
  
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Lancement
startServer();

// Exporter pour les tests
=======
// server.js - Point d'entrée du serveur optimisé
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const os = require('os');
const compression = require('compression'); // Compression GZIP
const helmet = require('helmet'); // Sécurité

// Chargement des variables d'environnement
dotenv.config();

// Import des modules
const { sequelize, testConnection } = require('./src/config/database');
const routes = require('./src/routes');
const { errorHandler, notFoundHandler } = require('./src/middlewares/errorHandler');
const { logger } = require('./src/middlewares/logger');

const app = express();

// ============================================================
// 1. Middlewares de sécurité et performance
// ============================================================

// Compression GZIP pour réduire la taille des réponses
app.use(compression({
  threshold: 1024, // Compresser les réponses > 1KB
  level: 6 // Niveau de compression (1-9)
}));

// Sécurité : protection contre les attaques courantes
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Autoriser les requêtes CORS spécifiques si besoin
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

// Logger des requêtes avec plus d'informations
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms) ${statusColor}`);
  });
  next();
});

// CORS optimisé
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
  maxAge: 86400 // Cache des pré-requêtes CORS (24h)
}));

// Parser JSON avec validation de taille
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

// Route de santé avec plus d'informations
app.get('/health', async (req, res) => {
  let dbStatus = 'OK';
  try {
    await sequelize.authenticate();
  } catch (e) {
    dbStatus = 'FAILED';
  }

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// Route racine API avec liste des endpoints
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

// Routes API
app.use('/api', routes);

// ============================================================
// 3. Gestion des erreurs
// ============================================================

// Route 404 avec message détaillé
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

// Gestionnaire d'erreurs global
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
  console.log('═══════════════════════════════════════════════════════\n');
}

// ============================================================
// 5. Démarrage du serveur
// ============================================================

const PORT = process.env.PORT || 3000;
const START_TIME = Date.now();

const startServer = async () => {
  console.log('🔄 Initialisation du serveur...');

  try {
    // Test de connexion
    await testConnection();
    console.log('✅ Connexion à la base de données établie');

    // Démarrage du serveur
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

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('💥 Erreur non capturée :', error);
  console.error('⚠️ Le serveur continue de fonctionner, mais une erreur critique est survenue.');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Rejet non géré :', reason);
});

// Gestion des signaux d'arrêt
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Signal ${signal} reçu. Arrêt du serveur...`);
  
  // Fermeture de la base de données
  try {
    await sequelize.close();
    console.log('✅ Connexion à la base fermée');
  } catch (err) {
    console.error('❌ Erreur lors de la fermeture de la base :', err);
  }
  
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Lancement
startServer();

// Exporter pour les tests
>>>>>>> c90dfa826fa04030f95bdcd2433429c62d674c63
module.exports = app;