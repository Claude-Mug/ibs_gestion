<<<<<<< HEAD
// middlewares/errorHandler.js
/**
 * Middleware de gestion d'erreurs global
 * Capture toutes les erreurs et renvoie une réponse formatée
 */

const { ValidationError, DatabaseError } = require('sequelize');

/**
 * Gestionnaire d'erreurs global
 * À placer en dernier dans la chaîne des middlewares
 * Utilisation: app.use(errorHandler)
 */
exports.errorHandler = (err, req, res, next) => {
  console.error('Erreur capturée:', err);

  // Erreurs de validation Sequelize
  if (err instanceof ValidationError) {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      error: 'Erreur de validation',
      details: errors
    });
  }

  // Erreurs de base de données
  if (err instanceof DatabaseError) {
    return res.status(500).json({
      error: 'Erreur de base de données',
      message: err.message
    });
  }

  // Erreur de duplication (UNIQUE constraint)
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Conflit',
      message: 'Une entrée avec ces données existe déjà'
    });
  }

  // Erreur de clé étrangère
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Référence invalide',
      message: 'La référence vers une autre entité est invalide'
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Erreur interne du serveur'
  });
};

/**
 * Middleware pour les routes non trouvées (404)
 */
exports.notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl
  });
=======
// middlewares/errorHandler.js
/**
 * Middleware de gestion d'erreurs global
 * Capture toutes les erreurs et renvoie une réponse formatée
 */

const { ValidationError, DatabaseError } = require('sequelize');

/**
 * Gestionnaire d'erreurs global
 * À placer en dernier dans la chaîne des middlewares
 * Utilisation: app.use(errorHandler)
 */
exports.errorHandler = (err, req, res, next) => {
  console.error('Erreur capturée:', err);

  // Erreurs de validation Sequelize
  if (err instanceof ValidationError) {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      error: 'Erreur de validation',
      details: errors
    });
  }

  // Erreurs de base de données
  if (err instanceof DatabaseError) {
    return res.status(500).json({
      error: 'Erreur de base de données',
      message: err.message
    });
  }

  // Erreur de duplication (UNIQUE constraint)
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Conflit',
      message: 'Une entrée avec ces données existe déjà'
    });
  }

  // Erreur de clé étrangère
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Référence invalide',
      message: 'La référence vers une autre entité est invalide'
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Erreur interne du serveur'
  });
};

/**
 * Middleware pour les routes non trouvées (404)
 */
exports.notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl
  });
>>>>>>> c90dfa826fa04030f95bdcd2433429c62d674c63
};