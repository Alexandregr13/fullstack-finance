require('mandatoryenv').load(['PORT', 'DB', 'SECRET'])

const app = require('./app')
const db = require('./models/database')

const { PORT } = process.env

// Test de connexion à la base de données
db.authenticate()
  .then(() => {
    console.log('Connexion à la base de données établie')

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`)
      console.log(`Documentation API: http://localhost:${PORT}/doc`)
    })
  })
  .catch(err => {
    console.error('Erreur de connexion à la base de données:', err)
    process.exit(1)
  })
