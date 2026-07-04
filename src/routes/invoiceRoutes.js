// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { 
  validate, 
  invoiceValidation, 
  statusValidation, 
  idValidation 
} = require('../middlewares/validationMiddleware');
const { pdfLimiter } = require('../middlewares/rateLimiter');

/**
 * Routes pour la gestion des factures
 */

// Récupère toutes les factures
router.get('/', invoiceController.getAllInvoices);

// Récupère le prochain numéro de facture
router.get('/next-number', invoiceController.getNextInvoiceNumber);

// Récupère une facture par ID
router.get('/:id', idValidation, validate, invoiceController.getInvoiceById);

// Crée une nouvelle facture
router.post('/', invoiceValidation, validate, invoiceController.createInvoice);

// Met à jour une facture
router.put('/:id', idValidation, invoiceValidation, validate, invoiceController.updateInvoice);

// Met à jour le statut d'une facture
router.patch('/:id/status', statusValidation, validate, invoiceController.updateInvoiceStatus);

// Supprime une facture
router.delete('/:id', idValidation, validate, invoiceController.deleteInvoice);

module.exports = router;