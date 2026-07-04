<<<<<<< HEAD
// routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { validate, clientValidation, idValidation } = require('../middlewares/validationMiddleware');

/**
 * Routes pour la gestion des clients
 */

// Récupère tous les clients
router.get('/', clientController.getAllClients);

// Récupère un client par ID
router.get('/:id', idValidation, validate, clientController.getClientById);

// Crée un nouveau client
router.post('/', clientValidation, validate, clientController.createClient);

// Met à jour un client
router.put('/:id', idValidation, clientValidation, validate, clientController.updateClient);

// Supprime un client
router.delete('/:id', idValidation, validate, clientController.deleteClient);

=======
// routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { validate, clientValidation, idValidation } = require('../middlewares/validationMiddleware');

/**
 * Routes pour la gestion des clients
 */

// Récupère tous les clients
router.get('/', clientController.getAllClients);

// Récupère un client par ID
router.get('/:id', idValidation, validate, clientController.getClientById);

// Crée un nouveau client
router.post('/', clientValidation, validate, clientController.createClient);

// Met à jour un client
router.put('/:id', idValidation, clientValidation, validate, clientController.updateClient);

// Supprime un client
router.delete('/:id', idValidation, validate, clientController.deleteClient);

>>>>>>> c90dfa826fa04030f95bdcd2433429c62d674c63
module.exports = router;