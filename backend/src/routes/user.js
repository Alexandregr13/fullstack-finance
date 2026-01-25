const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')

// ============ ROUTES PUBLIQUES ============

// POST /register - Inscription
router.post('/register', userController.register)

// POST /login - Connexion
router.post('/login', userController.login)

// ============ ROUTES PROTÉGÉES (TOKEN) ============

// GET /me - Utilisateur connecté
router.get('/me', userController.checkToken, userController.getMe)

// GET /api/users - Lister tous les utilisateurs
router.get('/api/users', userController.checkToken, userController.getUsers)

// GET /api/users/:id - Obtenir un utilisateur
router.get('/api/users/:id', userController.checkToken, userController.getUserById)

// PUT /api/password - Modifier son mot de passe
router.put('/api/password', userController.checkToken, userController.updatePassword)

// ============ ROUTES ADMIN ============

// PUT /api/users/:id - Modifier un utilisateur (admin)
router.put('/api/users/:id', userController.checkToken, userController.checkAdmin, userController.updateUser)

// DELETE /api/users/:id - Supprimer un utilisateur (admin)
router.delete('/api/users/:id', userController.checkToken, userController.checkAdmin, userController.deleteUser)

module.exports = router
