<<<<<<< HEAD
// routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authMiddleware } = require('../middlewares/authMiddleware');

/**
 * Routes pour les statistiques
 */

// Récupère les statistiques du tableau de bord
// Protégé par authentification (optionnel)
router.get('/dashboard', statsController.getDashboardStats);

=======
// routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authMiddleware } = require('../middlewares/authMiddleware');

/**
 * Routes pour les statistiques
 */

// Récupère les statistiques du tableau de bord
// Protégé par authentification (optionnel)
router.get('/dashboard', statsController.getDashboardStats);

>>>>>>> c90dfa826fa04030f95bdcd2433429c62d674c63
module.exports = router;