const { Sequelize } = require('sequelize')
require('mandatoryenv').load(['DB'])
const { DB } = process.env

// Configuration SQLite ou PostgreSQL selon la variable DB
const config = DB.includes('sqlite')
  ? {
      dialect: 'sqlite',
      storage: DB,
      logging: false
    }
  : DB

const db = new Sequelize(config)

module.exports = db
