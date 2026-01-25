/**
 * Génération automatique de la documentation Swagger
 * Usage: node src/util/swagger.js ou npm run doc
 */

const swaggerAutogen = require('swagger-autogen')()

const doc = {
  info: {
    title: 'API Conseils en Investissements',
    description: 'API Backend pour l\'application de conseils en investissements collaboratifs',
    version: '1.0.0'
  },
  host: 'localhost:3000',
  basePath: '/',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    { name: 'Auth', description: 'Authentification' },
    { name: 'Users', description: 'Gestion des utilisateurs' },
    { name: 'Advices', description: 'Gestion des conseils' },
    { name: 'Categories', description: 'Gestion des catégories' },
    { name: 'Comments', description: 'Gestion des commentaires' }
  ],
  securityDefinitions: {
    apiKeyAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'x-access-token',
      description: 'Token JWT obtenu via /login'
    }
  },
  definitions: {
    User: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      isAdmin: false,
      status: 'active'
    },
    Advice: {
      id: 1,
      title: 'Titre du conseil',
      summary: 'Résumé court',
      content: 'Contenu détaillé...',
      investmentType: 'long_term',
      estimatedGain: 15.5,
      confidenceIndex: 75,
      assets: ['AAPL', 'TSLA'],
      status: 'published'
    },
    Category: {
      id: 1,
      name: 'Actions',
      description: 'Catégorie des actions',
      parentId: null,
      level: 0
    },
    Comment: {
      id: 1,
      content: 'Super conseil !',
      status: 'visible'
    },
    Login: {
      email: 'user@example.com',
      password: 'password123'
    },
    Register: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    }
  }
}

const outputFile = './src/util/swagger-output.json'
const endpointsFiles = ['./src/app.js']

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Documentation Swagger générée: ' + outputFile)
})
