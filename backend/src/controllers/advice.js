const { Op } = require('sequelize')
const User = require('../models/users')
const Category = require('../models/categories')
const { Advice, AdviceCategory } = require('../models/advices')

// ============ CONTRÔLEURS ============

/**
 * GET /api/advices
 * Lister les conseils (avec pagination)
 */
async function getAdvices(req, res) {
  // #swagger.tags = ['Advices']
  // #swagger.summary = 'Lister les conseils'
  try {
    const { page = 1, limit = 10, category, type, sort = 'recent' } = req.query
    const offset = (page - 1) * limit

    const where = {}
    if (type) where.investmentType = type

    const order = [['createdAt', 'DESC']]

    const include = [
      { model: User, as: 'author', attributes: ['id', 'name'] },
      { model: Category, as: 'categories', attributes: ['id', 'name'], through: { attributes: [] } }
    ]

    // Filtre par catégorie
    if (category) {
      include[1].where = { id: category }
    }

    const { count, rows: advices } = await Advice.findAndCountAll({
      where,
      include,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    })

    res.json({
      advices,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    })
  } catch (err) {
    console.error('Erreur getAdvices:', err)
    res.status(500).json({ error: 'Erreur lors de la récupération des conseils' })
  }
}

/**
 * GET /api/advices/latest
 * 10 derniers conseils
 */
async function getLatestAdvices(req, res) {
  // #swagger.tags = ['Advices']
  // #swagger.summary = 'Obtenir les 10 derniers conseils'
  try {
    const advices = await Advice.findAll({
      include: [
        { model: User, as: 'author', attributes: ['id', 'name'] },
        { model: Category, as: 'categories', attributes: ['id', 'name'], through: { attributes: [] } }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    })

    res.json(advices)
  } catch (err) {
    console.error('Erreur getLatestAdvices:', err)
    res.status(500).json({ error: 'Erreur lors de la récupération des conseils' })
  }
}

/**
 * GET /api/myadvices
 * Mes conseils (TOKEN requis)
 */
async function getMyAdvices(req, res) {
  // #swagger.tags = ['Advices']
  // #swagger.summary = 'Lister mes conseils'
  // #swagger.security = [{ "apiKeyAuth": [] }]
  try {
    const advices = await Advice.findAll({
      where: { authorId: req.user.id },
      include: [
        { model: Category, as: 'categories', attributes: ['id', 'name'], through: { attributes: [] } }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.json(advices)
  } catch (err) {
    console.error('Erreur getMyAdvices:', err)
    res.status(500).json({ error: 'Erreur lors de la récupération de vos conseils' })
  }
}

/**
 * GET /api/advices/:id
 * Détail d'un conseil
 */
async function getAdviceById(req, res) {
  // #swagger.tags = ['Advices']
  // #swagger.summary = 'Obtenir un conseil par ID'
  try {
    const advice = await Advice.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name'] },
        { model: Category, as: 'categories', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    })

    if (!advice) {
      return res.status(404).json({ error: 'Conseil non trouvé' })
    }

    res.json(advice)
  } catch (err) {
    console.error('Erreur getAdviceById:', err)
    res.status(500).json({ error: 'Erreur lors de la récupération du conseil' })
  }
}

/**
 * POST /api/advices
 * Créer un conseil (TOKEN requis)
 */
async function createAdvice(req, res) {
  // #swagger.tags = ['Advices']
  // #swagger.summary = 'Créer un conseil'
  // #swagger.security = [{ "apiKeyAuth": [] }]
  try {
    const { title, summary, content, investmentType, estimatedGain, confidenceIndex, assets, categoryIds } = req.body

    // Validation
    if (!title || !content) {
      return res.status(400).json({ error: 'Titre et contenu requis' })
    }

    // Créer le conseil
    const advice = await Advice.create({
      title,
      summary,
      content,
      investmentType,
      estimatedGain,
      confidenceIndex,
      assets: assets || [],
      authorId: req.user.id
    })

    // Associer les catégories
    if (categoryIds && categoryIds.length > 0) {
      const categories = await Category.findAll({ where: { id: categoryIds } })
      await advice.setCategories(categories)
    }

    // Recharger avec les associations
    const result = await Advice.findByPk(advice.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name'] },
        { model: Category, as: 'categories', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    })

    res.status(201).json(result)
  } catch (err) {
    console.error('Erreur createAdvice:', err)
    res.status(500).json({ error: 'Erreur lors de la création du conseil' })
  }
}

/**
 * PUT /api/advices/:id
 * Modifier un conseil (owner ou admin)
 */
async function updateAdvice(req, res) {
  // #swagger.tags = ['Advices']
  // #swagger.summary = 'Modifier un conseil'
  // #swagger.security = [{ "apiKeyAuth": [] }]
  try {
    const advice = await Advice.findByPk(req.params.id)

    if (!advice) {
      return res.status(404).json({ error: 'Conseil non trouvé' })
    }

    // Vérifier les permissions
    if (advice.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Non autorisé à modifier ce conseil' })
    }

    const { title, summary, content, investmentType, estimatedGain, confidenceIndex, assets, categoryIds } = req.body

    // Mettre à jour les champs
    if (title) advice.title = title
    if (summary !== undefined) advice.summary = summary
    if (content) advice.content = content
    if (investmentType) advice.investmentType = investmentType
    if (estimatedGain !== undefined) advice.estimatedGain = estimatedGain
    if (confidenceIndex !== undefined) advice.confidenceIndex = confidenceIndex
    if (assets) advice.assets = assets

    await advice.save()

    // Mettre à jour les catégories
    if (categoryIds) {
      const categories = await Category.findAll({ where: { id: categoryIds } })
      await advice.setCategories(categories)
    }

    // Recharger avec les associations
    const result = await Advice.findByPk(advice.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name'] },
        { model: Category, as: 'categories', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    })

    res.json(result)
  } catch (err) {
    console.error('Erreur updateAdvice:', err)
    res.status(500).json({ error: 'Erreur lors de la modification du conseil' })
  }
}

/**
 * DELETE /api/advices/:id
 * Supprimer un conseil (owner ou admin)
 */
async function deleteAdvice(req, res) {
  // #swagger.tags = ['Advices']
  // #swagger.summary = 'Supprimer un conseil'
  // #swagger.security = [{ "apiKeyAuth": [] }]
  try {
    const advice = await Advice.findByPk(req.params.id)

    if (!advice) {
      return res.status(404).json({ error: 'Conseil non trouvé' })
    }

    // Vérifier les permissions
    if (advice.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Non autorisé à supprimer ce conseil' })
    }

    await advice.destroy()

    res.json({ message: 'Conseil supprimé avec succès' })
  } catch (err) {
    console.error('Erreur deleteAdvice:', err)
    res.status(500).json({ error: 'Erreur lors de la suppression du conseil' })
  }
}

/**
 * GET /api/search
 * Recherche de conseils
 */
async function searchAdvices(req, res) {
  // #swagger.tags = ['Advices']
  // #swagger.summary = 'Rechercher des conseils'
  try {
    const { q, category, type, minGain, maxGain, minConfidence } = req.query

    const where = {}

    // Recherche textuelle
    if (q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { summary: { [Op.like]: `%${q}%` } },
        { content: { [Op.like]: `%${q}%` } }
      ]
    }

    // Filtres
    if (type) where.investmentType = type
    if (minGain) where.estimatedGain = { ...where.estimatedGain, [Op.gte]: parseFloat(minGain) }
    if (maxGain) where.estimatedGain = { ...where.estimatedGain, [Op.lte]: parseFloat(maxGain) }
    if (minConfidence) where.confidenceIndex = { [Op.gte]: parseFloat(minConfidence) }

    const include = [
      { model: User, as: 'author', attributes: ['id', 'name'] },
      { model: Category, as: 'categories', attributes: ['id', 'name'], through: { attributes: [] } }
    ]

    if (category) {
      include[1].where = { id: category }
    }

    const advices = await Advice.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
      limit: 50
    })

    res.json(advices)
  } catch (err) {
    console.error('Erreur searchAdvices:', err)
    res.status(500).json({ error: 'Erreur lors de la recherche' })
  }
}

module.exports = {
  getAdvices,
  getLatestAdvices,
  getMyAdvices,
  getAdviceById,
  createAdvice,
  updateAdvice,
  deleteAdvice,
  searchAdvices
}
