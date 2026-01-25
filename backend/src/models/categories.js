const { DataTypes } = require('sequelize')
const db = require('./database')

/**
 * Modèle Category (catégories hiérarchiques)
 * - id: INTEGER, clé primaire auto-incrémentée
 * - name: STRING, nom de la catégorie
 * - description: TEXT, description optionnelle
 * - parentId: INTEGER, référence vers la catégorie parente (null = racine)
 * - level: INTEGER, niveau dans la hiérarchie (0 = racine)
 */
const Category = db.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'categories'
})

// Auto-référence pour la hiérarchie
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' })
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' })

module.exports = Category
