<<<<<<< HEAD
// routes/index.js
const express = require('express');
const router = express.Router();

// Import des routes
const clientRoutes = require('./clientRoutes');
const productRoutes = require('./productRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const statsRoutes = require('./statsRoutes');
const importExportRoutes = require('./importExportRoutes');

// Middlewares
const { authMiddleware } = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimiter');

// Application des limites de débit à toutes les routes
router.use(apiLimiter);

// Routes publiques (si besoin)
router.use('/clients', clientRoutes);
router.use('/products', productRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/stats', statsRoutes);
router.use('/import-export', importExportRoutes);

// Route de santé (health check)
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

=======
// routes/index.js
const express = require('express');
const router = express.Router();

// Import des routes
const clientRoutes = require('./clientRoutes');
const productRoutes = require('./productRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const statsRoutes = require('./statsRoutes');
const importExportRoutes = require('./importExportRoutes');

// Middlewares
const { authMiddleware } = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimiter');

// Application des limites de débit à toutes les routes
router.use(apiLimiter);

// Routes publiques (si besoin)
router.use('/clients', clientRoutes);
router.use('/products', productRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/stats', statsRoutes);
router.use('/import-export', importExportRoutes);

// Route de santé (health check)
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

>>>>>>> c90dfa826fa04030f95bdcd2433429c62d674c63
module.exports = router;