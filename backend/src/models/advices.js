const { DataTypes } = require('sequelize')
const db = require('./database')
const User = require('./users')
const Category = require('./categories')

/**
 * Modèle Advice (conseil en investissement)
 * - id: INTEGER, clé primaire auto-incrémentée
 * - title: STRING, titre du conseil
 * - summary: TEXT, résumé court
 * - content: TEXT, contenu détaillé
 * - investmentType: ENUM, type d'investissement (court/moyen/long terme)
 * - estimatedGain: FLOAT, plus/moins-value estimée en %
 * - confidenceIndex: FLOAT, indice de confiance (0-100)
 * - assets: TEXT, liste des actifs référencés (JSON stringifié)
 * - authorId: INTEGER, référence vers l'auteur
 */
const Advice = db.define('Advice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  investmentType: {
    type: DataTypes.ENUM('short_term', 'medium_term', 'long_term'),
    allowNull: true
  },
  estimatedGain: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  confidenceIndex: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  assets: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('assets')
      return rawValue ? JSON.parse(rawValue) : []
    },
    set(value) {
      this.setDataValue('assets', JSON.stringify(value || []))
    }
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'advices'
})

// Table de jointure pour la relation many-to-many Advice <-> Category
const AdviceCategory = db.define('AdviceCategory', {}, {
  tableName: 'advice_categories',
  timestamps: false
})

// Relations
User.hasMany(Advice, { foreignKey: 'authorId', as: 'advices', onDelete: 'CASCADE' })
Advice.belongsTo(User, { foreignKey: 'authorId', as: 'author' })

Advice.belongsToMany(Category, { through: AdviceCategory, as: 'categories', foreignKey: 'adviceId' })
Category.belongsToMany(Advice, { through: AdviceCategory, as: 'advices', foreignKey: 'categoryId' })

module.exports = { Advice, AdviceCategory }
