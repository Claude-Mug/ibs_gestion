
// controllers/statsController.js
const { Invoice, Client, InvoiceItem } = require('../models');
const { Op } = require('sequelize');

/**
 * Contrôleur pour les statistiques du tableau de bord
 * Fournit des indicateurs clés de performance
 */

/**
 * Récupère les statistiques du tableau de bord
 * GET /api/stats/dashboard
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Nombre total de factures
    const totalInvoices = await Invoice.count();

    // Nombre de factures payées
    const paidInvoices = await Invoice.count({
      where: { status: 'payée' }
    });

    // Nombre de factures impayées
    const unpaidInvoices = await Invoice.count({
      where: { status: 'impayée' }
    });

    // Nombre total de clients
    const totalClients = await Client.count();

    // Chiffre d'affaires du mois en cours (factures payées uniquement)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyInvoices = await Invoice.findAll({
      where: {
        status: 'payée',
        invoiceDate: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth]
        }
      },
      include: [{ model: InvoiceItem, as: 'Items' }]
    });

    let monthlyRevenue = 0;
    for (const invoice of monthlyInvoices) {
      // Calcul du total de chaque facture
      let invoiceTotal = 0;
      for (const item of invoice.Items) {
        const subtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
        const tvaRate = parseFloat(item.tvaRate) || 0;
        invoiceTotal += subtotal * (1 + tvaRate / 100);
      }
      monthlyRevenue += invoiceTotal;
    }

    // Chiffre d'affaires total (toutes les factures payées)
    const allPaidInvoices = await Invoice.findAll({
      where: { status: 'payée' },
      include: [{ model: InvoiceItem, as: 'Items' }]
    });

    let totalRevenue = 0;
    for (const invoice of allPaidInvoices) {
      let invoiceTotal = 0;
      for (const item of invoice.Items) {
        const subtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
        const tvaRate = parseFloat(item.tvaRate) || 0;
        invoiceTotal += subtotal * (1 + tvaRate / 100);
      }
      totalRevenue += invoiceTotal;
    }

    res.json({
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      totalClients,
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
      totalRevenue: parseFloat(totalRevenue.toFixed(2))
    });
  } catch (error) {
    console.error('Erreur getDashboardStats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};