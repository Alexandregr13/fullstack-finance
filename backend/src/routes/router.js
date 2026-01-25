const express = require('express')
const router = express.Router()

// Import des routes
const userRoutes = require('./user')
const adviceRoutes = require('./advice')
const categoryRoutes = require('./category')

// Montage des routes
router.use(userRoutes)
router.use(adviceRoutes)
router.use(categoryRoutes)

// Route de santé
router.get('/health', (req, res) => {
  // #swagger.tags = ['Health']
  // #swagger.summary = 'Vérifier l\'état du serveur'
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

module.exports = router
