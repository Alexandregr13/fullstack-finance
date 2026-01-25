require('mandatoryenv').load(['DB', 'SECRET'])

const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()

// Middleware de parsing JSON
app.use(express.json())

// Configuration CORS
app.use(cors())

// Servir le frontend en production
app.use('/frontend', express.static(path.join(__dirname, 'frontend')))

// Documentation Swagger (si le fichier existe)
try {
  const swaggerUi = require('swagger-ui-express')
  const swaggerFile = require('./util/swagger-output.json')
  app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
} catch (err) {
  console.log('Documentation Swagger non disponible. Lancez "npm run doc" pour la générer.')
}

// Routes
const router = require('./routes/router')
app.use(router)

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    name: 'API Conseils en Investissements',
    version: '1.0.0',
    documentation: '/doc',
    health: '/health'
  })
})

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' })
})

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err.stack)
  res.status(500).json({ error: 'Erreur interne du serveur' })
})

module.exports = app
