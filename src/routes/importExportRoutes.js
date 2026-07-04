<<<<<<< HEAD
// routes/importExportRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const importExportController = require('../controllers/importExportController');
const { validate, idValidation } = require('../middlewares/validationMiddleware');
//const { authMiddleware } = require('../middlewares/authMiddleware');

// Protégé par authentification (optionnel)
// router.use(authMiddleware);

/**
 * Routes d'import/export des factures
 */

// Exporter toutes les factures
router.get('/export/all', importExportController.exportAllInvoices);

// Exporter une facture au format JSON
router.get('/export/:id', idValidation, validate, importExportController.exportInvoice);
// Importer une facture (via JSON dans le body ou via fichier)
router.post('/import', importExportController.importInvoice);

// Importer un lot de factures via fichier JSON uploadé
router.post('/import/batch', upload.single('file'), importExportController.importBatch);

=======
// routes/importExportRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const importExportController = require('../controllers/importExportController');
const { validate, idValidation } = require('../middlewares/validationMiddleware');
//const { authMiddleware } = require('../middlewares/authMiddleware');

// Protégé par authentification (optionnel)
// router.use(authMiddleware);

/**
 * Routes d'import/export des factures
 */

// Exporter toutes les factures
router.get('/export/all', importExportController.exportAllInvoices);

// Exporter une facture au format JSON
router.get('/export/:id', idValidation, validate, importExportController.exportInvoice);
// Importer une facture (via JSON dans le body ou via fichier)
router.post('/import', importExportController.importInvoice);

// Importer un lot de factures via fichier JSON uploadé
router.post('/import/batch', upload.single('file'), importExportController.importBatch);

>>>>>>> c90dfa826fa04030f95bdcd2433429c62d674c63
module.exports = router;