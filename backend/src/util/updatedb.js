/**
 * Script de mise à jour / initialisation de la base de données
 * Usage: node src/util/updatedb.js
 *
 * Ce script synchronise les modèles Sequelize avec la base de données
 * Option {force: true} pour recréer les tables (ATTENTION: supprime les données!)
 */

require('mandatoryenv').load(['DB'])

const db = require('../models/database')
const User = require('../models/users')
const Category = require('../models/categories')
const { Advice, AdviceCategory } = require('../models/advices')

const bcrypt = require('bcrypt')

async function updateDatabase() {
  try {
    // Synchronisation des modèles (force: true recrée les tables)
    await db.sync({ force: true })
    console.log('Base de données synchronisée')

    // Création d'un utilisateur admin par défaut
    const adminHash = await bcrypt.hash('admin123', 10)
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      passhash: adminHash,
      isAdmin: true
    })
    console.log('Utilisateur admin créé:', admin.email)

    // Création d'un utilisateur standard pour les tests
    const userHash = await bcrypt.hash('user123', 10)
    const user = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      passhash: userHash,
      isAdmin: false
    })
    console.log('Utilisateur test créé:', user.email)

    // Création de catégories de base
    const catActions = await Category.create({
      name: 'Actions',
      description: 'Conseils sur les actions boursières',
      level: 0
    })

    const catCrypto = await Category.create({
      name: 'Crypto-monnaies',
      description: 'Conseils sur les crypto-monnaies',
      level: 0
    })

    const catObligations = await Category.create({
      name: 'Obligations',
      description: 'Conseils sur les obligations',
      level: 0
    })

    // Sous-catégories
    await Category.create({
      name: 'Tech',
      description: 'Actions technologiques',
      parentId: catActions.id,
      level: 1
    })

    await Category.create({
      name: 'Finance',
      description: 'Actions financières',
      parentId: catActions.id,
      level: 1
    })

    console.log('Catégories créées')

    // Création d'un conseil exemple
    const advice = await Advice.create({
      title: 'Investir dans les valeurs technologiques',
      summary: 'Les grandes tech restent des valeurs sûres pour le long terme',
      content: 'Les entreprises technologiques comme Apple, Microsoft et Google continuent de montrer une croissance solide. Leur position dominante sur le marché et leur capacité d\'innovation en font des investissements intéressants pour le long terme.',
      investmentType: 'long_term',
      estimatedGain: 15.5,
      confidenceIndex: 75,
      assets: ['AAPL', 'MSFT', 'GOOGL'],
      authorId: admin.id
    })

    // Associer le conseil à une catégorie
    await advice.addCategory(catActions)

    console.log('Conseil exemple créé')

    console.log('\n=== Base de données initialisée avec succès ===')
    console.log('Admin: admin@example.com / admin123')
    console.log('User: user@example.com / user123')

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la base de données:', error)
    process.exit(1)
  }
}

updateDatabase()
