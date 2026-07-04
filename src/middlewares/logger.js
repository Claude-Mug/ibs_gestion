
// middlewares/logger.js
/**
 * Middleware de journalisation (logging)
 * Enregistre toutes les requêtes HTTP pour le débogage et l'audit
 */

const fs = require('fs');
const path = require('path');

/**
 * Middleware de logging des requêtes
 * Enregistre la méthode, l'URL, le statut et le temps de réponse
 */
exports.logger = (req, res, next) => {
  const start = Date.now();
  
  // Capture le statut de la réponse
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const logMessage = `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${statusCode} - ${duration}ms`;
    
    // Affiche dans la console
    console.log(logMessage);
    
    // Écrit dans un fichier de log (optionnel)
    // const logDir = path.join(__dirname, '../logs');
    // if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    // fs.appendFileSync(path.join(logDir, 'requests.log'), logMessage + '\n');
    
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware de logging des erreurs
 * Enregistre les erreurs dans un fichier séparé
 */
exports.errorLogger = (err, req, res, next) => {
  const logMessage = `${new Date().toISOString()} - ERROR - ${req.method} ${req.originalUrl} - ${err.message}`;
  console.error(logMessage);
  
  // Écrit dans un fichier d'erreurs (optionnel)
  // const logDir = path.join(__dirname, '../logs');
  // if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  // fs.appendFileSync(path.join(logDir, 'errors.log'), logMessage + '\n');
  // fs.appendFileSync(path.join(logDir, 'errors.log'), err.stack + '\n\n');
  
  next(err);
};