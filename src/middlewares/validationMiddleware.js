
// middlewares/validationMiddleware.js
/**
 * Middlewares de validation des données
 * Utilise des schémas de validation pour chaque route
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware de validation des résultats
 * Vérifie si des erreurs de validation existent
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: errors.array().map(e => ({
        field: e.path,
        message: e.msg
      }))
    });
  }
  next();
};

/**
 * Schéma de validation pour la création d'un client
 */
exports.clientValidation = [
  body('name')
    .notEmpty().withMessage('Le nom est obligatoire')
    .isString().withMessage('Le nom doit être une chaîne de caractères')
    .trim(),
  
  body('email')
    .notEmpty().withMessage('L\'email est obligatoire')
    .isEmail().withMessage('L\'email doit être valide')
    .normalizeEmail(),
  
  body('phone')
    .notEmpty().withMessage('Le téléphone est obligatoire')
    .isString().withMessage('Le téléphone doit être une chaîne de caractères')
    .trim(),
  
  body('address')
    .notEmpty().withMessage('L\'adresse est obligatoire')
    .isString().withMessage('L\'adresse doit être une chaîne de caractères')
    .trim(),
  
  body('company')
    .optional()
    .isString().withMessage('La société doit être une chaîne de caractères')
    .trim(),
  
  body('tva_number')
    .optional()
    .isString().withMessage('Le numéro de TVA doit être une chaîne de caractères')
    .trim()
];

/**
 * Schéma de validation pour la création d'un produit
 */
exports.productValidation = [
  body('name')
    .notEmpty().withMessage('Le nom est obligatoire')
    .isString().withMessage('Le nom doit être une chaîne de caractères')
    .trim(),
  
  body('unit_price')
    .notEmpty().withMessage('Le prix unitaire est obligatoire')
    .isFloat({ min: 0 }).withMessage('Le prix unitaire doit être un nombre positif'),
  
  body('unit')
    .optional()
    .isString().withMessage('L\'unité doit être une chaîne de caractères')
    .trim(),
  
  body('tva_rate')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Le taux de TVA doit être entre 0 et 100')
];

/**
 * Schéma de validation pour la création d'une facture
 */
exports.invoiceValidation = [
  body('clientId')
    .notEmpty().withMessage('L\'ID du client est obligatoire')
    .isInt({ min: 1 }).withMessage('L\'ID du client doit être un nombre entier positif'),
  
  body('invoiceDate')
    .notEmpty().withMessage('La date de facture est obligatoire')
    .isISO8601().withMessage('La date doit être au format ISO 8601')
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Date invalide');
      }
      return true;
    }),
  
  body('dueDate')
    .optional()
    .isISO8601().withMessage('La date d\'échéance doit être au format ISO 8601')
    .custom((value, { req }) => {
      if (value) {
        const dueDate = new Date(value);
        const invoiceDate = new Date(req.body.invoiceDate);
        if (dueDate < invoiceDate) {
          throw new Error('La date d\'échéance ne peut pas être antérieure à la date de facture');
        }
      }
      return true;
    }),
  
  body('paymentTerms')
    .optional()
    .isString().withMessage('Les conditions de paiement doivent être une chaîne de caractères')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['payée', 'impayée', 'partielle']).withMessage('Le statut doit être: payée, impayée ou partielle'),
  
  body('amountPaid')
    .optional()
    .isFloat({ min: 0 }).withMessage('Le montant payé doit être un nombre positif'),
  
  body('currencySymbol')
    .optional()
    .isString().withMessage('Le symbole de la devise doit être une chaîne de caractères')
    .trim(),
  
  body('items')
    .notEmpty().withMessage('Les articles sont obligatoires')
    .isArray({ min: 1 }).withMessage('La liste des articles doit contenir au moins un élément')
    .custom((items) => {
      for (const item of items) {
        if (!item.name) {
          throw new Error('Chaque article doit avoir un nom');
        }
        if (item.unitPrice !== undefined && (isNaN(item.unitPrice) || item.unitPrice < 0)) {
          throw new Error('Le prix unitaire doit être un nombre positif');
        }
        if (item.quantity !== undefined && (isNaN(item.quantity) || item.quantity <= 0)) {
          throw new Error('La quantité doit être un nombre positif');
        }
      }
      return true;
    })
];

/**
 * Schéma de validation pour la mise à jour du statut
 */
exports.statusValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('L\'ID doit être un nombre entier positif'),
  
  body('status')
    .notEmpty().withMessage('Le statut est obligatoire')
    .isIn(['payée', 'impayée', 'partielle']).withMessage('Le statut doit être: payée, impayée ou partielle'),
  
  body('amountPaid')
    .optional()
    .isFloat({ min: 0 }).withMessage('Le montant payé doit être un nombre positif')
];

/**
 * Schéma de validation pour les paramètres d'ID
 */
exports.idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('L\'ID doit être un nombre entier positif')

];