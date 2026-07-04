
// controllers/importExportController.js
// Contrôleur d'import/export optimisé pour la production
// Avec gestion des transactions, logs détaillés et traitements par lots

const { Invoice, Client, InvoiceItem, sequelize } = require('../models');
const sequelize = require('../config/database').sequelize;
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');

// --- Configuration ---
const BATCH_SIZE = 50; // Nombre d'items à traiter par lot pour les insertions
const MAX_RETRY = 3;

// --- Logging helper ---
const log = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 📊 [ImportExport] ${message}`);
  if (data) console.log(`   ${JSON.stringify(data, null, 2)}`);
};

const logError = (message, error) => {
  console.error(`❌ [ImportExport] ${message}`);
  console.error(`   ${error.message}`);
  if (error.stack) console.error(`   Stack: ${error.stack}`);
};

/**
 * Fonction utilitaire : conversion sécurisée en nombre
 */
const safeNum = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

/**
 * Fonction utilitaire : validation des données d'une facture
 */
const validateInvoiceData = (data) => {
  if (!data.invoiceNumber) {
    throw new Error('Le numéro de facture est obligatoire');
  }
  if (!data.client && !data.clientId) {
    throw new Error('Le client est obligatoire (client ou clientId)');
  }
  return true;
};

/**
 * Traite l'import d'une seule facture avec transaction
 * Version optimisée avec upsert et gestion des erreurs granulaire
 */
   /**
 * Traite l'import d'une seule facture avec transaction
 * Version optimisée : recherche client par ID/email/nom, mise à jour si trouvé,
 * insertion en lot des articles, gestion des signatures.
 * @param {Object} data - Données de la facture (invoiceNumber, client, items, etc.)
 * @param {Object} transaction - Transaction Sequelize (optionnel)
 * @returns {Promise<Object>} { updated, invoice, duration }
 */
async function processSingleInvoiceImport(data, transaction = null) {
  const startTime = Date.now();
  const invoiceNumber = data.invoiceNumber || 'inconnue';
  log(`📥 Import de la facture ${invoiceNumber}...`);

  // --- 1. Validation des données minimales ---
  validateInvoiceData(data);

  // --- 2. Gestion du client (recherche intelligente) ---
  let clientRecord = null;
  const clientData = data.client || {}; // données client (peuvent être partielles)

  // 2.1 Recherche par ID (si fourni)
  if (clientData.id) {
    clientRecord = await Client.findByPk(clientData.id, { transaction });
    if (clientRecord) {
      log(`   ✅ Client trouvé par ID (${clientRecord.id}) : ${clientRecord.name}`);
      // Mise à jour des informations du client si des données plus complètes sont fournies
      const updates = {};
      if (clientData.name && clientData.name !== clientRecord.name) updates.name = clientData.name;
      if (clientData.email && clientData.email !== clientRecord.email) updates.email = clientData.email;
      if (clientData.phone && clientData.phone !== clientRecord.phone) updates.phone = clientData.phone;
      if (clientData.address && clientData.address !== clientRecord.address) updates.address = clientData.address;
      if (clientData.company !== undefined && clientData.company !== clientRecord.company) updates.company = clientData.company;
      if (clientData.tvaNumber !== undefined && clientData.tvaNumber !== clientRecord.tva_number) updates.tva_number = clientData.tvaNumber;
      
      if (Object.keys(updates).length > 0) {
        await clientRecord.update(updates, { transaction });
        log(`   🔄 Client mis à jour : ${Object.keys(updates).join(', ')}`);
      }
      // On garde le client trouvé, pas besoin de créer
    }
  }

  // 2.2 Si non trouvé par ID, recherche par email (prioritaire)
  if (!clientRecord && clientData.email) {
    clientRecord = await Client.findOne({
      where: { email: clientData.email },
      transaction
    });
    if (clientRecord) {
      log(`   ✅ Client trouvé par email (${clientData.email}) : ${clientRecord.name}`);
      // Mise à jour si le nom est différent (ex: "Client importé" → vrai nom)
      if (clientData.name && clientData.name !== clientRecord.name) {
        await clientRecord.update({ name: clientData.name }, { transaction });
        log(`   🔄 Nom client mis à jour : ${clientData.name}`);
      }
      // Mise à jour des autres champs si manquants
      const updates = {};
      if (clientData.phone && !clientRecord.phone) updates.phone = clientData.phone;
      if (clientData.address && !clientRecord.address) updates.address = clientData.address;
      if (clientData.company !== undefined && clientRecord.company === null) updates.company = clientData.company;
      if (clientData.tvaNumber !== undefined && clientRecord.tva_number === null) updates.tva_number = clientData.tvaNumber;
      if (Object.keys(updates).length > 0) {
        await clientRecord.update(updates, { transaction });
        log(`   🔄 Complément d'infos client : ${Object.keys(updates).join(', ')}`);
      }
    }
  }

  // 2.3 Si non trouvé par email, recherche par nom (attention aux homonymes)
  if (!clientRecord && clientData.name) {
    // On évite de créer un doublon si plusieurs clients ont le même nom
    // → on prend le premier (mais on pourrait affiner avec d'autres critères)
    clientRecord = await Client.findOne({
      where: { name: clientData.name },
      transaction
    });
    if (clientRecord) {
      log(`   ✅ Client trouvé par nom (${clientData.name}) : ID ${clientRecord.id}`);
      // Mise à jour de l'email si manquant
      if (clientData.email && !clientRecord.email) {
        await clientRecord.update({ email: clientData.email }, { transaction });
        log(`   🔄 Email client complété : ${clientData.email}`);
      }
    }
  }

  // 2.4 Création d'un nouveau client si aucun trouvé
  if (!clientRecord) {
    log(`   📝 Création d'un nouveau client...`);
    // On utilise les données fournies ou des valeurs par défaut
    const newClientData = {
      name: clientData.name || 'Client importé (inconnu)',
      email: clientData.email || `import_${Date.now()}@inconnu.com`,
      phone: clientData.phone || '',
      address: clientData.address || '',
      company: clientData.company || null,
      tva_number: clientData.tvaNumber || null,
      createdAt: new Date()
    };
    clientRecord = await Client.create(newClientData, { transaction });
    log(`   ✅ Client créé avec ID ${clientRecord.id}`);
  }

  // --- 3. Vérification de l'existence de la facture ---
  let existingInvoice = await Invoice.findOne({
    where: { invoiceNumber: data.invoiceNumber },
    transaction
  });

  // --- 4. Préparation des données de la facture ---
  const invoiceData = {
    invoiceNumber: data.invoiceNumber,
    clientId: clientRecord.id,
    tvaRate: safeNum(data.tvaRate) || 20,
    status: data.status || 'impayée',
    paymentTerms: data.paymentTerms || 'Paiement sous 30 jours',
    notes: data.notes || null,
    signatureImagePath: data.signatureImagePath || null, // ← conservé tel quel
    amountPaid: safeNum(data.amountPaid),
    currencySymbol: data.currencySymbol || 'CDF',
    invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : new Date(),
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
  };

  let invoiceRecord;
  let isUpdate = false;

  // --- 5. UPSERT (update ou create) ---
  if (existingInvoice) {
    log(`   🔄 Mise à jour de la facture existante (ID ${existingInvoice.id})`);
    await existingInvoice.update(invoiceData, { transaction });
    invoiceRecord = existingInvoice;
    isUpdate = true;
    // Supprimer les anciens articles
    await InvoiceItem.destroy({
      where: { invoiceId: existingInvoice.id },
      transaction
    });
  } else {
    log(`   📝 Création d'une nouvelle facture`);
    invoiceRecord = await Invoice.create(invoiceData, { transaction });
    isUpdate = false;
  }

  // --- 6. Insertion des articles en lot (bulkCreate) ---
  if (data.items && Array.isArray(data.items) && data.items.length > 0) {
    log(`   📦 Insertion de ${data.items.length} articles...`);
    
    const itemsToCreate = data.items.map(item => ({
      invoiceId: invoiceRecord.id,
      name: item.name || 'Article',
      description: item.description || '',
      quantity: safeNum(item.quantity) || 1,
      unitPrice: safeNum(item.unitPrice),
      unit: item.unit || 'unité',
      tvaRate: safeNum(item.tvaRate) || 20
    }));

    // Utilisation de bulkCreate pour une insertion rapide
    await InvoiceItem.bulkCreate(itemsToCreate, {
      transaction,
      validate: true, // validation des champs
      // Si vous voulez ignorer les erreurs de validation (moins sûr) :
      // ignoreDuplicates: false
    });
    log(`   ✅ ${itemsToCreate.length} articles insérés`);
  }

  // --- 7. Recharger la facture complète (avec relations) ---
  const fullInvoice = await Invoice.findByPk(invoiceRecord.id, {
    include: [
      { model: Client, as: 'Client' },
      { model: InvoiceItem, as: 'Items' }
    ],
    transaction
  });

  const duration = Date.now() - startTime;
  log(`✅ Import terminé en ${duration}ms (${isUpdate ? 'mise à jour' : 'création'})`);

  return {
    updated: isUpdate,
    invoice: fullInvoice,
    duration
  };
}

/**
 * EXPORT : Télécharge une facture au format JSON
 * GET /api/import-export/export/:id
 */
exports.exportInvoice = async (req, res) => {
  const startTime = Date.now();
  try {
    const { id } = req.params;
    log(`📤 Export de la facture ID ${id}`);

    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: Client, as: 'Client' },
        { model: InvoiceItem, as: 'Items' }
      ]
    });

    if (!invoice) {
      log(`❌ Facture ID ${id} non trouvée`);
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        client: invoice.Client ? {
          id: invoice.Client.id,
          name: invoice.Client.name,
          email: invoice.Client.email,
          phone: invoice.Client.phone,
          address: invoice.Client.address,
          company: invoice.Client.company,
          tvaNumber: invoice.Client.tva_number
        } : null,
        status: invoice.status,
        paymentTerms: invoice.paymentTerms,
        notes: invoice.notes,
        amountPaid: parseFloat(invoice.amountPaid),
        currencySymbol: invoice.currencySymbol,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        items: invoice.Items.map(item => ({
          name: item.name,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          unit: item.unit,
          tvaRate: parseFloat(item.tvaRate)
        }))
      }
    };

    const duration = Date.now() - startTime;
    log(`✅ Export terminé en ${duration}ms`);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.invoiceNumber}.json`);
    res.json(exportData);

  } catch (error) {
    logError('Erreur exportInvoice', error);
    res.status(500).json({ error: 'Erreur lors de l\'export' });
  }
};

/**
 * EXPORT ALL : Télécharge toutes les factures en JSON
 * GET /api/import-export/export/all
 */
exports.exportAllInvoices = async (req, res) => {
  const startTime = Date.now();
  try {
    log('📤 Export de toutes les factures...');

    // Optimisation : on limite les champs pour réduire la taille
    const invoices = await Invoice.findAll({
      include: [
        { model: Client, as: 'Client' },
        { model: InvoiceItem, as: 'Items' }
      ],
      order: [['createdAt', 'DESC']],
      // On peut ajouter une limite si nécessaire
      limit: parseInt(req.query.limit) || 1000
    });

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      total: invoices.length,
      invoices: invoices.map(inv => ({
        invoiceNumber: inv.invoiceNumber,
        client: inv.Client ? {
          id: inv.Client.id,
          name: inv.Client.name,
          email: inv.Client.email,
          phone: inv.Client.phone,
          address: inv.Client.address,
          company: inv.Client.company,
          tvaNumber: inv.Client.tva_number
        } : null,
        status: inv.status,
        paymentTerms: inv.paymentTerms,
        notes: inv.notes,
        amountPaid: parseFloat(inv.amountPaid),
        currencySymbol: inv.currencySymbol,
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        items: inv.Items.map(item => ({
          name: item.name,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          unit: item.unit,
          tvaRate: parseFloat(item.tvaRate)
        }))
      }))
    };

    const duration = Date.now() - startTime;
    log(`✅ Export terminé : ${invoices.length} factures en ${duration}ms`);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=invoices_export.json');
    res.json(exportData);

  } catch (error) {
    logError('Erreur exportAllInvoices', error);
    res.status(500).json({ error: 'Erreur lors de l\'export' });
  }
};

/**
 * IMPORT : Importe une facture depuis un JSON
 * POST /api/import-export/import
 */
exports.importInvoice = async (req, res) => {
  const startTime = Date.now();
  try {
    let importData = req.body;

    // Extraction des données
    if (importData.invoiceData) importData = importData.invoiceData;
    if (importData.invoice) importData = importData.invoice;

    // Si c'est un tableau (import multiple)
    if (Array.isArray(importData)) {
      return res.status(400).json({ 
        error: 'Utilisez /import/batch pour l\'import multiple' 
      });
    }

    // Traitement avec transaction
    const result = await sequelize.transaction(async (t) => {
      return await processSingleInvoiceImport(importData, t);
    });

    const duration = Date.now() - startTime;
    log(`✅ Import terminé en ${duration}ms`);

    res.status(201).json({
      message: result.updated ? 'Facture mise à jour' : 'Facture importée avec succès',
      result
    });

  } catch (error) {
    logError('Erreur importInvoice', error);
    if (error.message.includes('obligatoire')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Numéro de facture déjà existant' });
    }
    res.status(500).json({ 
      error: 'Erreur lors de l\'import', 
      details: error.message 
    });
  }
};

/**
 * IMPORT BATCH : Importe plusieurs factures depuis un fichier JSON
 * POST /api/import-export/import/batch
 */
exports.importBatch = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    log(`📦 Import en lot depuis le fichier : ${req.file.originalname} (${req.file.size} bytes)`);

    // Lecture et parsing
    const content = req.file.buffer.toString();
    let importData = JSON.parse(content);

    // Extraction du tableau de factures
    let invoicesArray = [];
    if (importData.invoices && Array.isArray(importData.invoices)) {
      invoicesArray = importData.invoices;
    } else if (Array.isArray(importData)) {
      invoicesArray = importData;
    } else {
      invoicesArray = [importData];
    }

    log(`📊 ${invoicesArray.length} factures à traiter`);

    // Traitement en lots avec transaction
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < invoicesArray.length; i += BATCH_SIZE) {
      const batch = invoicesArray.slice(i, Math.min(i + BATCH_SIZE, invoicesArray.length));
      log(`   📦 Lot ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} factures`);

      // Traitement du lot avec transaction
      const batchResults = await sequelize.transaction(async (t) => {
        const batchResultsInner = [];
        for (const invData of batch) {
          try {
            const result = await processSingleInvoiceImport(invData, t);
            batchResultsInner.push({
              success: true,
              invoiceNumber: invData.invoiceNumber || 'inconnu',
              result: {
                updated: result.updated,
                duration: result.duration
              }
            });
            successCount++;
          } catch (err) {
            logError(`   ❌ Échec facture ${invData.invoiceNumber || 'inconnue'}`, err);
            batchResultsInner.push({
              success: false,
              invoiceNumber: invData.invoiceNumber || 'inconnu',
              error: err.message
            });
            errorCount++;
          }
        }
        return batchResultsInner;
      });

      results.push(...batchResults);
      log(`   ✅ Lot terminé : ${batchResults.filter(r => r.success).length} réussis`);
    }

    const duration = Date.now() - startTime;
    log(`✅ Import en lot terminé en ${duration}ms : ${successCount} réussis, ${errorCount} échecs`);

    res.json({
      message: `Import terminé : ${successCount} réussis, ${errorCount} échecs`,
      stats: {
        total: invoicesArray.length,
        success: successCount,
        errors: errorCount,
        duration: `${duration}ms`
      },
      results
    });

  } catch (error) {
    logError('Erreur importBatch', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'import en lot', 
      details: error.message 
    });
  }

};
