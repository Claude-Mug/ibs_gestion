<<<<<<< HEAD
// controllers/productController.js
const { Product } = require('../models');

/**
 * Contrôleur pour la gestion des produits/services
 */

/**
 * Récupère tous les produits actifs
 * GET /api/products
 */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Erreur getAllProducts:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
  }
};

/**
 * Récupère tous les produits (y compris inactifs)
 * GET /api/products/all
 */
exports.getAllProductsIncludingInactive = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['name', 'ASC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Erreur getAllProductsIncludingInactive:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
  }
};

/**
 * Récupère un produit par son ID
 * GET /api/products/:id
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Erreur getProductById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
  }
};

/**
 * Crée un nouveau produit
 * POST /api/products
 * Body: { name, description, unit_price, unit, tva_rate? }
 */
exports.createProduct = async (req, res) => {
  try {
    const { name, description, unit_price, unit, tva_rate } = req.body;
    
    if (!name || unit_price === undefined) {
      return res.status(400).json({ error: 'Le nom et le prix unitaire sont obligatoires' });
    }
    
    const product = await Product.create({
      name,
      description: description || '',
      unitPrice: unit_price,
      unit: unit || 'unité',
      tvaRate: tva_rate || 20.0,
      isActive: true,
      createdAt: new Date()
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Erreur createProduct:', error);
    res.status(500).json({ error: 'Erreur lors de la création du produit' });
  }
};

/**
 * Met à jour un produit
 * PUT /api/products/:id
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, unit_price, unit, tva_rate, is_active } = req.body;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      unitPrice: unit_price !== undefined ? unit_price : product.unitPrice,
      unit: unit || product.unit,
      tvaRate: tva_rate !== undefined ? tva_rate : product.tvaRate,
      isActive: is_active !== undefined ? is_active : product.isActive
    });
    
    res.json(product);
  } catch (error) {
    console.error('Erreur updateProduct:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
  }
};

/**
 * Supprime (soft delete) un produit
 * DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    // Soft delete
    await product.update({ isActive: false });
    res.json({ message: 'Produit désactivé avec succès' });
  } catch (error) {
    console.error('Erreur deleteProduct:', error);
    res.status(500).json({ error: 'Erreur lors de la désactivation du produit' });
  }
=======
// controllers/productController.js
const { Product } = require('../models');

/**
 * Contrôleur pour la gestion des produits/services
 */

/**
 * Récupère tous les produits actifs
 * GET /api/products
 */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Erreur getAllProducts:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
  }
};

/**
 * Récupère tous les produits (y compris inactifs)
 * GET /api/products/all
 */
exports.getAllProductsIncludingInactive = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['name', 'ASC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Erreur getAllProductsIncludingInactive:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
  }
};

/**
 * Récupère un produit par son ID
 * GET /api/products/:id
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Erreur getProductById:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
  }
};

/**
 * Crée un nouveau produit
 * POST /api/products
 * Body: { name, description, unit_price, unit, tva_rate? }
 */
exports.createProduct = async (req, res) => {
  try {
    const { name, description, unit_price, unit, tva_rate } = req.body;
    
    if (!name || unit_price === undefined) {
      return res.status(400).json({ error: 'Le nom et le prix unitaire sont obligatoires' });
    }
    
    const product = await Product.create({
      name,
      description: description || '',
      unitPrice: unit_price,
      unit: unit || 'unité',
      tvaRate: tva_rate || 20.0,
      isActive: true,
      createdAt: new Date()
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Erreur createProduct:', error);
    res.status(500).json({ error: 'Erreur lors de la création du produit' });
  }
};

/**
 * Met à jour un produit
 * PUT /api/products/:id
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, unit_price, unit, tva_rate, is_active } = req.body;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      unitPrice: unit_price !== undefined ? unit_price : product.unitPrice,
      unit: unit || product.unit,
      tvaRate: tva_rate !== undefined ? tva_rate : product.tvaRate,
      isActive: is_active !== undefined ? is_active : product.isActive
    });
    
    res.json(product);
  } catch (error) {
    console.error('Erreur updateProduct:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
  }
};

/**
 * Supprime (soft delete) un produit
 * DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    // Soft delete
    await product.update({ isActive: false });
    res.json({ message: 'Produit désactivé avec succès' });
  } catch (error) {
    console.error('Erreur deleteProduct:', error);
    res.status(500).json({ error: 'Erreur lors de la désactivation du produit' });
  }
>>>>>>> c90dfa826fa04030f95bdcd2433429c62d674c63
};