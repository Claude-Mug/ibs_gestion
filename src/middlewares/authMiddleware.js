<<<<<<< HEAD
// middlewares/authMiddleware.js
/**
 * Middleware d'authentification
 * Vérifie la présence et la validité d'un token JWT
 * À adapter selon votre système d'authentification
 */

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Vérifie le token JWT présent dans le header Authorization
 * Utilisation: router.get('/protected', authMiddleware, handler)
 */
exports.authMiddleware = (req, res, next) => {
  try {
    // Récupère le token du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }

    // Format: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Format de token invalide' });
    }

    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = decoded; // Stocke les informations de l'utilisateur

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide' });
    }
    console.error('Erreur authMiddleware:', error);
    return res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};

/**
 * Middleware optionnel pour vérifier si l'utilisateur est administrateur
 * Doit être utilisé après authMiddleware
 */
exports.adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé - Droits administrateur requis' });
  }
  next();
=======
// middlewares/authMiddleware.js
/**
 * Middleware d'authentification
 * Vérifie la présence et la validité d'un token JWT
 * À adapter selon votre système d'authentification
 */

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Vérifie le token JWT présent dans le header Authorization
 * Utilisation: router.get('/protected', authMiddleware, handler)
 */
exports.authMiddleware = (req, res, next) => {
  try {
    // Récupère le token du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }

    // Format: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Format de token invalide' });
    }

    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = decoded; // Stocke les informations de l'utilisateur

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide' });
    }
    console.error('Erreur authMiddleware:', error);
    return res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};

/**
 * Middleware optionnel pour vérifier si l'utilisateur est administrateur
 * Doit être utilisé après authMiddleware
 */
exports.adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé - Droits administrateur requis' });
  }
  next();
>>>>>>> c90dfa826fa04030f95bdcd2433429c62d674c63
};