const express = require('express')
const router = express.Router()
const adviceController = require('../controllers/advice')
const { checkToken } = require('../controllers/user')

// ============ ROUTES PUBLIQUES ============

// GET /api/advices - Lister les conseils (avec pagination)
router.get('/api/advices', adviceController.getAdvices)

// GET /api/advices/latest - 10 derniers conseils
router.get('/api/advices/latest', adviceController.getLatestAdvices)

// GET /api/search - Recherche de conseils
router.get('/api/search', adviceController.searchAdvices)

// GET /api/advices/:id - Détail d'un conseil
router.get('/api/advices/:id', adviceController.getAdviceById)

// ============ ROUTES PROTÉGÉES (TOKEN) ============

// GET /api/myadvices - Mes conseils
router.get('/api/myadvices', checkToken, adviceController.getMyAdvices)

// POST /api/advices - Créer un conseil
router.post('/api/advices', checkToken, adviceController.createAdvice)

// PUT /api/advices/:id - Modifier un conseil
router.put('/api/advices/:id', checkToken, adviceController.updateAdvice)

// DELETE /api/advices/:id - Supprimer un conseil
router.delete('/api/advices/:id', checkToken, adviceController.deleteAdvice)

module.exports = router
