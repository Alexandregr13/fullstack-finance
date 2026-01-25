const bcrypt = require('bcrypt')
const jws = require('jws')
const User = require('../models/users')

require('mandatoryenv').load(['SECRET'])
const { SECRET } = process.env

// ============ FONCTIONS UTILITAIRES ============

/**
 * Génère un token JWT pour un utilisateur
 */
function generateToken(user) {
  return jws.sign({
    header: { alg: 'HS256' },
    payload: {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    },
    secret: SECRET
  })
}

/**
 * Vérifie et décode un token JWT
 */
function verifyToken(token) {
  if (!token) return null
  try {
    const isValid = jws.verify(token, 'HS256', SECRET)
    if (!isValid) return null
    const decoded = jws.decode(token)
    return JSON.parse(decoded.payload)
  } catch (err) {
    return null
  }
}

// ============ CONTRÔLEURS ============

/**
 * POST /register
 * Créer un nouvel utilisateur
 */
async function register(req, res) {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Créer un nouvel utilisateur'
  try {
    const { name, email, password } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis (name, email, password)' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' })
    }

    // Vérifier si l'email existe déjà
    const existing = await User.findOne({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' })
    }

    // Hasher le mot de passe et créer l'utilisateur
    const passhash = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email,
      passhash,
      isAdmin: false
    })

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    })
  } catch (err) {
    console.error('Erreur register:', err)
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' })
  }
}

/**
 * POST /login
 * Authentification et obtention du token
 */
async function login(req, res) {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Obtenir un token d\'authentification'
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' })
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.passhash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }

    // Générer le token
    const token = generateToken(user)

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    })
  } catch (err) {
    console.error('Erreur login:', err)
    res.status(500).json({ error: 'Erreur lors de la connexion' })
  }
}

/**
 * GET /me
 * Obtenir les informations de l'utilisateur connecté
 */
async function getMe(req, res) {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Obtenir l\'utilisateur connecté'
  // #swagger.security = [{ "apiKeyAuth": [] }]
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    isAdmin: req.user.isAdmin
  })
}

/**
 * GET /api/users
 * Lister tous les utilisateurs (TOKEN requis)
 */
async function getUsers(req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Lister tous les utilisateurs'
  // #swagger.security = [{ "apiKeyAuth": [] }]
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'isAdmin', 'createdAt']
    })
    res.json(users)
  } catch (err) {
    console.error('Erreur getUsers:', err)
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' })
  }
}

/**
 * GET /api/users/:id
 * Obtenir un utilisateur par son ID
 */
async function getUserById(req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Obtenir un utilisateur par ID'
  // #swagger.security = [{ "apiKeyAuth": [] }]
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'isAdmin', 'createdAt']
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    res.json(user)
  } catch (err) {
    console.error('Erreur getUserById:', err)
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' })
  }
}

/**
 * PUT /api/password
 * Modifier le mot de passe de l'utilisateur connecté
 */
async function updatePassword(req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Modifier son mot de passe'
  // #swagger.security = [{ "apiKeyAuth": [] }]
  try {
    const { password, newPassword } = req.body

    if (!password || !newPassword) {
      return res.status(400).json({ error: 'Ancien et nouveau mot de passe requis' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' })
    }

    // Vérifier l'ancien mot de passe
    const validPassword = await bcrypt.compare(password, req.user.passhash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' })
    }

    // Mettre à jour le mot de passe
    const passhash = await bcrypt.hash(newPassword, 10)
    await req.user.update({ passhash })

    res.json({ message: 'Mot de passe mis à jour avec succès' })
  } catch (err) {
    console.error('Erreur updatePassword:', err)
    res.status(500).json({ error: 'Erreur lors de la modification du mot de passe' })
  }
}

/**
 * PUT /api/users/:id
 * Modifier un utilisateur (ADMIN uniquement)
 */
async function updateUser(req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Modifier un utilisateur (admin)'
  // #swagger.security = [{ "apiKeyAuth": [] }]
  try {
    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    const { name, email, password, isAdmin } = req.body

    // Mettre à jour les champs fournis
    if (name) user.name = name
    if (email) user.email = email
    if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin
    if (password) {
      user.passhash = await bcrypt.hash(password, 10)
    }

    await user.save()

    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    })
  } catch (err) {
    console.error('Erreur updateUser:', err)
    res.status(500).json({ error: 'Erreur lors de la modification de l\'utilisateur' })
  }
}

/**
 * DELETE /api/users/:id
 * Supprimer un utilisateur (ADMIN uniquement)
 */
async function deleteUser(req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Supprimer un utilisateur (admin)'
  // #swagger.security = [{ "apiKeyAuth": [] }]
  try {
    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Empêcher la suppression de son propre compte
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' })
    }

    await user.destroy()

    res.json({ message: 'Utilisateur supprimé avec succès' })
  } catch (err) {
    console.error('Erreur deleteUser:', err)
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' })
  }
}

// ============ MIDDLEWARE ============

/**
 * Middleware de vérification du token
 * Vérifie que le token est présent et valide
 */
async function checkToken(req, res, next) {
  const token = req.headers['x-access-token']

  if (!token) {
    return res.status(403).json({ error: 'Token manquant' })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return res.status(403).json({ error: 'Token invalide' })
  }

  // Récupérer l'utilisateur depuis la base
  const user = await User.findByPk(payload.id)
  if (!user) {
    return res.status(403).json({ error: 'Utilisateur non trouvé' })
  }

  req.user = user
  next()
}

/**
 * Middleware de vérification des droits admin
 */
function checkAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' })
  }
  next()
}

module.exports = {
  register,
  login,
  getMe,
  getUsers,
  getUserById,
  updatePassword,
  updateUser,
  deleteUser,
  checkToken,
  checkAdmin,
  verifyToken,
  generateToken
}
