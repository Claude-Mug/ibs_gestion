
// middlewares/rateLimiter.js
/**
 * Middleware de limitation de débit (rate limiting)
 * Protège l'API contre les abus et les attaques par force brute
 */

const rateLimit = require('express-rate-limit');

/**
 * Limiteur standard pour les routes API
 * Limite à 100 requêtes par 15 minutes
 */
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes par fenêtre
  message: {
    error: 'Trop de requêtes, veuillez réessayer dans 15 minutes'
  },
  standardHeaders: true, // Retourne les headers RateLimit-*
  legacyHeaders: false, // Désactive les headers X-RateLimit-* obsolètes
  skipSuccessfulRequests: false // Compte aussi les requêtes réussies
});

/**
 * Limiteur strict pour les routes sensibles (login, création, etc.)
 * Limite à 20 requêtes par 10 minutes
 */
exports.strictLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limite de 20 requêtes par fenêtre
  message: {
    error: 'Trop de requêtes sur cette opération sensible, veuillez réessayer dans 10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Limiteur pour la génération de PDF
 * Limite à 10 requêtes par 5 minutes (les PDF peuvent être lourds)
 */
exports.pdfLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: {
    error: 'Trop de générations de PDF, veuillez réessayer dans 5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false

});