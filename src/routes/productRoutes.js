
// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validate, productValidation, idValidation } = require('../middlewares/validationMiddleware');

/**
 * Routes pour la gestion des produits
 */

// Récupère tous les produits actifs
router.get('/', productController.getAllProducts);

// Récupère tous les produits (y compris inactifs)
router.get('/all', productController.getAllProductsIncludingInactive);

// Récupère un produit par ID
router.get('/:id', idValidation, validate, productController.getProductById);

// Crée un nouveau produit
router.post('/', productValidation, validate, productController.createProduct);

// Met à jour un produit
router.put('/:id', idValidation, productValidation, validate, productController.updateProduct);

// Supprime (désactive) un produit
router.delete('/:id', idValidation, validate, productController.deleteProduct);

module.exports = router;