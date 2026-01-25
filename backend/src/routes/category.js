const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/category')
const { checkToken, checkAdmin } = require('../controllers/user')

// ============ ROUTES PUBLIQUES ============

// GET /api/categories - Arbre des catégories
router.get('/api/categories', categoryController.getCategories)

// GET /api/categories/flat - Liste plate des catégories
router.get('/api/categories/flat', categoryController.getCategoriesFlat)

// GET /api/categories/:id - Détail d'une catégorie
router.get('/api/categories/:id', categoryController.getCategoryById)

// GET /api/categories/:id/advices - Conseils d'une catégorie
router.get('/api/categories/:id/advices', categoryController.getCategoryAdvices)

// ============ ROUTES ADMIN ============

// POST /api/categories - Créer une catégorie (admin)
router.post('/api/categories', checkToken, checkAdmin, categoryController.createCategory)

// PUT /api/categories/:id - Modifier une catégorie (admin)
router.put('/api/categories/:id', checkToken, checkAdmin, categoryController.updateCategory)

// DELETE /api/categories/:id - Supprimer une catégorie (admin)
router.delete('/api/categories/:id', checkToken, checkAdmin, categoryController.deleteCategory)

module.exports = router
