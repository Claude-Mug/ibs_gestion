
// controllers/clientController.js
const { Client } = require('../models');

/**
 * Contrôleur pour la gestion des clients
 * Toutes les fonctions sont asynchrones et gèrent les erreurs
 */

/**
 * Récupère tous les clients
 * GET /api/clients
 */
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll({
      order: [['name', 'ASC']]
    });
    res.json(clients);
  } catch (error) {
    console.error('Erreur getAllClients:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
  }
};

/**
 * Récupère un client par son ID
 * GET /api/clients/:id
 */
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);
    
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Erreur getClientById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du client' });
  }
};

/**
 * Crée un nouveau client
 * POST /api/clients
 * Body: { name, email, phone, address, company?, tva_number? }
 */
exports.createClient = async (req, res) => {
  try {
    const { name, email, phone, address, company, tva_number } = req.body;
    
    // Validation simple
    if (!name || !email || !phone || !address) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }
    
    const client = await Client.create({
      name,
      email,
      phone,
      address,
      company: company || null,
      tva_number: tva_number || null,
      created_at: new Date()
    });
    
    res.status(201).json(client);
  } catch (error) {
    console.error('Erreur createClient:', error);
    res.status(500).json({ error: 'Erreur lors de la création du client' });
  }
};

/**
 * Met à jour un client existant
 * PUT /api/clients/:id
 * Body: { name, email, phone, address, company?, tva_number? }
 */
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, company, tva_number } = req.body;
    
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    await client.update({
      name: name || client.name,
      email: email || client.email,
      phone: phone || client.phone,
      address: address || client.address,
      company: company !== undefined ? company : client.company,
      tva_number: tva_number !== undefined ? tva_number : client.tva_number
    });
    
    res.json(client);
  } catch (error) {
    console.error('Erreur updateClient:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du client' });
  }
};

/**
 * Supprime un client (soft delete possible mais ici hard delete)
 * DELETE /api/clients/:id
 */
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    
    await client.destroy();
    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    console.error('Erreur deleteClient:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du client' });
  }
};


