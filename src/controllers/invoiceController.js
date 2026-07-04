
// controllers/invoiceController.js
const { Invoice, Client, InvoiceItem } = require('../models');
const { Op } = require('sequelize');

/**
 * Contrôleur pour la gestion des factures
 * Gère toutes les opérations CRUD et les calculs de montants
 */

/**
 * Fonction utilitaire pour sécuriser les nombres
 */
const safeValue = (value) => {
  if (isNaN(value) || !isFinite(value)) return 0;
  return value;
};

/**
 * Récupère toutes les factures avec leurs clients et articles
 * GET /api/invoices
 */
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [
        { model: Client, as: 'Client' },
        { model: InvoiceItem, as: 'Items' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(invoices);
  } catch (error) {
    console.error('Erreur getAllInvoices:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des factures' });
  }
};

/**
 * Récupère une facture par son ID avec tous ses détails
 * GET /api/invoices/:id
 */
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(id, {
      include: [
        { model: Client, as: 'Client' },
        { model: InvoiceItem, as: 'Items' }
      ]
    });
    
    if (!invoice) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error('Erreur getInvoiceById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la facture' });
  }
};

/**
 * Génère le prochain numéro de facture pour l'année en cours
 * Utilise MAX(invoice_number) pour éviter les doublons
 * GET /api/invoices/next-number
 */
exports.getNextInvoiceNumber = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const prefix = `IBS-${year}-`;
    
    // Récupère le plus grand numéro existant pour l'année
    const invoices = await Invoice.findAll({
      where: {
        invoiceNumber: {
          [Op.like]: `${prefix}%`
        }
      },
      attributes: ['invoiceNumber'],
      order: [['invoiceNumber', 'DESC']],
      limit: 1
    });
    
    let nextNumber = 1;
    if (invoices.length > 0) {
      const lastNumber = invoices[0].invoiceNumber;
      // Extrait la partie numérique après le préfixe
      const numericPart = lastNumber.substring(prefix.length);
      const num = parseInt(numericPart, 10);
      if (!isNaN(num)) {
        nextNumber = num + 1;
      }
    }
    
    const invoiceNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`;
    res.json({ invoiceNumber });
  } catch (error) {
    console.error('Erreur getNextInvoiceNumber:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du numéro de facture' });
  }
};

/**
 * Crée une nouvelle facture avec ses articles
 * POST /api/invoices
 * Body: { clientId, invoiceDate, dueDate?, paymentTerms, status, amountPaid, currencySymbol, notes, items: [...] }
 */
exports.createInvoice = async (req, res) => {
  try {
    const {
      clientId,
      invoiceDate,
      dueDate,
      paymentTerms,
      status,
      amountPaid,
      currencySymbol,
      notes,
      items
    } = req.body;

    // Validation des champs obligatoires
    if (!clientId || !invoiceDate || !items || items.length === 0) {
      return res.status(400).json({ error: 'Client, date et articles sont obligatoires' });
    }

    // Génère le numéro de facture unique
    const year = new Date().getFullYear();
    const prefix = `IBS-${year}-`;
    
    // Trouve le dernier numéro pour l'année
    const lastInvoice = await Invoice.findOne({
      where: {
        invoiceNumber: {
          [Op.like]: `${prefix}%`
        }
      },
      order: [['invoiceNumber', 'DESC']]
    });
    
    let nextNumber = 1;
    if (lastInvoice) {
      const numericPart = lastInvoice.invoiceNumber.substring(prefix.length);
      const num = parseInt(numericPart, 10);
      if (!isNaN(num)) nextNumber = num + 1;
    }
    const invoiceNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`;

    // Crée la facture
    const invoice = await Invoice.create({
      invoiceNumber,
      clientId,
      tvaRate: 20.0,
      status: status || 'impayée',
      paymentTerms: paymentTerms || 'Paiement sous 30 jours',
      notes: notes || null,
      amountPaid: amountPaid || 0,
      currencySymbol: currencySymbol || 'CDF',
      invoiceDate: new Date(invoiceDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      createdAt: new Date()
    });

    // Crée les articles de la facture
    const createdItems = [];
    for (const item of items) {
      const invoiceItem = await InvoiceItem.create({
        invoiceId: invoice.id,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        unit: item.unit || 'unité',
        tvaRate: item.tvaRate || 20.0
      });
      createdItems.push(invoiceItem);
    }

    // Récupère la facture complète avec ses relations
    const fullInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: Client, as: 'Client' },
        { model: InvoiceItem, as: 'Items' }
      ]
    });

    res.status(201).json(fullInvoice);
  } catch (error) {
    console.error('Erreur createInvoice:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la facture' });
  }
};

/**
 * Met à jour une facture existante
 * PUT /api/invoices/:id
 */
exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clientId,
      status,
      paymentTerms,
      notes,
      signatureImagePath,
      amountPaid,
      currencySymbol,
      invoiceDate,
      dueDate,
      items
    } = req.body;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    // Mise à jour des champs
    await invoice.update({
      clientId: clientId || invoice.clientId,
      status: status || invoice.status,
      paymentTerms: paymentTerms || invoice.paymentTerms,
      notes: notes !== undefined ? notes : invoice.notes,
      signatureImagePath: signatureImagePath !== undefined ? signatureImagePath : invoice.signatureImagePath,
      amountPaid: amountPaid !== undefined ? amountPaid : invoice.amountPaid,
      currencySymbol: currencySymbol || invoice.currencySymbol,
      invoiceDate: invoiceDate ? new Date(invoiceDate) : invoice.invoiceDate,
      dueDate: dueDate ? new Date(dueDate) : invoice.dueDate
    });

    // Si des articles sont fournis, on les remplace
    if (items && items.length > 0) {
      // Supprime les anciens articles
      await InvoiceItem.destroy({
        where: { invoiceId: id }
      });
      
      // Crée les nouveaux articles
      for (const item of items) {
        await InvoiceItem.create({
          invoiceId: id,
          name: item.name,
          description: item.description || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          unit: item.unit || 'unité',
          tvaRate: item.tvaRate || 20.0
        });
      }
    }

    // Récupère la facture mise à jour
    const updatedInvoice = await Invoice.findByPk(id, {
      include: [
        { model: Client, as: 'Client' },
        { model: InvoiceItem, as: 'Items' }
      ]
    });

    res.json(updatedInvoice);
  } catch (error) {
    console.error('Erreur updateInvoice:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la facture' });
  }
};

/**
 * Met à jour uniquement le statut et le montant payé d'une facture
 * PATCH /api/invoices/:id/status
 * Body: { status, amountPaid? }
 */
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, amountPaid } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Le statut est obligatoire' });
    }

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    // Calcul du montant payé en fonction du statut
    let newAmountPaid = invoice.amountPaid;
    if (status === 'payée') {
      newAmountPaid = invoice.total;
    } else if (status === 'impayée') {
      newAmountPaid = 0;
    } else if (status === 'partielle') {
      if (amountPaid !== undefined) {
        // Validation du montant partiel
        const total = invoice.total;
        if (amountPaid < 0 || amountPaid >= total) {
          return res.status(400).json({ 
            error: 'Le montant payé doit être supérieur à 0 et inférieur au total' 
          });
        }
        newAmountPaid = amountPaid;
      } else {
        // Si amountPaid non fourni, on garde la valeur existante
        newAmountPaid = invoice.amountPaid;
      }
    }

    await invoice.update({
      status: status,
      amountPaid: newAmountPaid
    });

    // Récupère la facture mise à jour
    const updatedInvoice = await Invoice.findByPk(id, {
      include: [
        { model: Client, as: 'Client' },
        { model: InvoiceItem, as: 'Items' }
      ]
    });

    res.json(updatedInvoice);
  } catch (error) {
    console.error('Erreur updateInvoiceStatus:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

/**
 * Supprime une facture (hard delete)
 * DELETE /api/invoices/:id
 */
exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }
    
    // Supprime d'abord les articles (CASCADE via la base de données)
    // Mais si ce n'est pas configuré, on le fait manuellement
    await InvoiceItem.destroy({
      where: { invoiceId: id }
    });
    
    await invoice.destroy();
    res.json({ message: 'Facture supprimée avec succès' });
  } catch (error) {
    console.error('Erreur deleteInvoice:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la facture' });
  }

};