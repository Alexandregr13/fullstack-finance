const Category = require('../models/categories')
const { Advice } = require('../models/advices')
const User = require('../models/users')

// ============ CONTRÔLEURS ============

/**
 * GET /api/categories
 * Arbre des catégories
 */
async function getCategories(req, res) {
  // #swagger.tags = ['Categories']
  // #swagger.summary = 'Obtenir l\'arbre des catégories'
  try {
    // Récupérer toutes les catégories racines avec leurs enfants
    const categories = await Category.findAll({
      where: { parentId: null },
      include: [{
        model: Category,
        as: 'children',
        include: [{
          model: Category,
          as: 'children'
        }]
      }],
      order: [['name', 'ASC']]
    })

    res.json(categories)
  } catch (err) {
    console.error('Erreur getCategories:', err)
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' })
  }
}

/**
 * GET /api/categories/flat
 * Liste plate des catégories
 */
async function getCategoriesFlat(req, res) {
  // #swagger.tags = ['Categories']
  // #swagger.summary = 'Obtenir la liste plate des catégories'
  try {
    const categories = await Category.findAll({
      order: [['level', 'ASC'], ['name', 'ASC']]
    })

    res.json(categories)
  } catch (err) {
    console.error('Erreur getCategoriesFlat:', err)
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' })
  }
}

/**
 * GET /api/categories/:id
 * Détail d'une catégorie
 */
async function getCategoryById(req, res) {
  // #swagger.tags = ['Categories']
  // #swagger.summary = 'Obtenir une catégorie par ID'
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'parent', attributes: ['id', 'name'] },
        { model: Category, as: 'children', attributes: ['id', 'name'] }
      ]
    })

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' })
    }

    res.json(category)
  } catch (err) {
    console.error('Erreur getCategoryById:', err)
    res.status(500).json({ error: 'Erreur lors de la récupération de la catégorie' })
  }
}

/**
 * GET /api/categories/:id/advices
 * Conseils d'une catégorie
 */
async function getCategoryAdvices(req, res) {
  // #swagger.tags = ['Categories']
  // #swagger.summary = 'Obtenir les conseils d\'une catégorie'
  try {
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    const category = await Category.findByPk(req.params.id, {
      include: [{
        model: Advice,
        as: 'advices',
        where: { status: 'published' },
        include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
        through: { attributes: [] },
        required: false
      }]
    })

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' })
    }

    // Pagination manuelle
    const total = category.advices ? category.advices.length : 0
    const advices = category.advices ? category.advices.slice(offset, offset + parseInt(limit)) : []

    res.json({
      category: { id: category.id, name: category.name },
      advices,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    })
  } catch (err) {
    console.error('Erreur getCategoryAdvices:', err)
    res.status(500).json({ error: 'Erreur lors de la récupération des conseils' })
  }
}

/**
 * POST /api/categories
 * Créer une catégorie (ADMIN)
 */
async function createCategory(req, res) {
  // #swagger.tags = ['Categories']
  // #swagger.summary = 'Créer une catégorie (admin)'
  // #swagger.security = [{ "apiKeyAuth": [] }]
  try {
    const { name, description, parentId } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Nom de la catégorie requis' })
    }

    let level = 0
    if (parentId) {
      const parent = await Category.findByPk(parentId)
      if (!parent) {
        return res.status(404).json({ error: 'Catégorie parente non trouvée' })
      }
      level = parent.level + 1
    }

    const category = await Category.create({
      name,
      description,
      parentId,
      level
    })

    res.status(201).json(category)
  } catch (err) {
    console.error('Erreur createCategory:', err)
    res.status(500).json({ error: 'Erreur lors de la création de la catégorie' })
  }
}

/**
 * PUT /api/categories/:id
 * Modifier une catégorie (ADMIN)
 */
async function updateCategory(req, res) {
  // #swagger.tags = ['Categories']
  // #swagger.summary = 'Modifier une catégorie (admin)'
  // #swagger.security = [{ "apiKeyAuth": [] }]
  try {
    const category = await Category.findByPk(req.params.id)

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' })
    }

    const { name, description, parentId } = req.body

    if (name) category.name = name
    if (description !== undefined) category.description = description

    if (parentId !== undefined) {
      // Empêcher de définir comme parent une de ses propres sous-catégories
      if (parentId === category.id) {
        return res.status(400).json({ error: 'Une catégorie ne peut pas être son propre parent' })
      }

      if (parentId) {
        const parent = await Category.findByPk(parentId)
        if (!parent) {
          return res.status(404).json({ error: 'Catégorie parente non trouvée' })
        }
        category.parentId = parentId
        category.level = parent.level + 1
      } else {
        category.parentId = null
        category.level = 0
      }
    }

    await category.save()

    res.json(category)
  } catch (err) {
    console.error('Erreur updateCategory:', err)
    res.status(500).json({ error: 'Erreur lors de la modification de la catégorie' })
  }
}

/**
 * DELETE /api/categories/:id
 * Supprimer une catégorie (ADMIN)
 */
async function deleteCategory(req, res) {
  // #swagger.tags = ['Categories']
  // #swagger.summary = 'Supprimer une catégorie (admin)'
  // #swagger.security = [{ "apiKeyAuth": [] }]
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Category, as: 'children' }]
    })

    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' })
    }

    // Vérifier s'il y a des sous-catégories
    if (category.children && category.children.length > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer une catégorie avec des sous-catégories'
      })
    }

    await category.destroy()

    res.json({ message: 'Catégorie supprimée avec succès' })
  } catch (err) {
    console.error('Erreur deleteCategory:', err)
    res.status(500).json({ error: 'Erreur lors de la suppression de la catégorie' })
  }
}

module.exports = {
  getCategories,
  getCategoriesFlat,
  getCategoryById,
  getCategoryAdvices,
  createCategory,
  updateCategory,
  deleteCategory
}
