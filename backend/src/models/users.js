const { DataTypes } = require('sequelize')
const db = require('./database')

/**
 * Modèle User
 * - id: INTEGER, clé primaire auto-incrémentée
 * - name: STRING, nom de l'utilisateur
 * - email: STRING, unique, identifiant de connexion
 * - passhash: STRING, hash du mot de passe
 * - isAdmin: BOOLEAN, droits d'administration
 */
const User = db.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passhash: {
    type: DataTypes.STRING(60),
    allowNull: false
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'users'
})

module.exports = User
