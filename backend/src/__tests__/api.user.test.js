const request = require('supertest')
const app = require('../app')
const db = require('../models/database')
const User = require('../models/users')
const bcrypt = require('bcrypt')

describe('API User', () => {
  let adminToken
  let userToken
  let adminUser
  let normalUser

  // Avant tous les tests, initialiser la base de données
  beforeAll(async () => {
    await db.sync({ force: true })

    // Créer un admin
    const adminHash = await bcrypt.hash('admin123', 10)
    adminUser = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      passhash: adminHash,
      isAdmin: true
    })

    // Créer un utilisateur normal
    const userHash = await bcrypt.hash('user123', 10)
    normalUser = await User.create({
      name: 'User',
      email: 'user@test.com',
      passhash: userHash,
      isAdmin: false
    })

    // Obtenir les tokens
    const adminRes = await request(app)
      .post('/login')
      .send({ email: 'admin@test.com', password: 'admin123' })
    adminToken = adminRes.body.token

    const userRes = await request(app)
      .post('/login')
      .send({ email: 'user@test.com', password: 'user123' })
    userToken = userRes.body.token
  })

  afterAll(async () => {
    await db.close()
  })

  // ============ TESTS REGISTER ============

  describe('POST /register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          name: 'New User',
          email: 'new@test.com',
          password: 'password123'
        })

      expect(res.statusCode).toBe(201)
      expect(res.body.user).toHaveProperty('id')
      expect(res.body.user.email).toBe('new@test.com')
      expect(res.body.user.isAdmin).toBe(false)
      expect(res.body.user).not.toHaveProperty('passhash')
    })

    it('devrait refuser un email déjà utilisé', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          name: 'Another User',
          email: 'admin@test.com',
          password: 'password123'
        })

      expect(res.statusCode).toBe(409)
      expect(res.body).toHaveProperty('error')
    })

    it('devrait refuser si des champs sont manquants', async () => {
      const res = await request(app)
        .post('/register')
        .send({ name: 'Test' })

      expect(res.statusCode).toBe(400)
    })

    it('devrait refuser un mot de passe trop court', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          name: 'Test',
          email: 'short@test.com',
          password: '123'
        })

      expect(res.statusCode).toBe(400)
    })
  })

  // ============ TESTS LOGIN ============

  describe('POST /login', () => {
    it('devrait retourner un token avec des identifiants valides', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'admin@test.com',
          password: 'admin123'
        })

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user.email).toBe('admin@test.com')
    })

    it('devrait refuser un mot de passe incorrect', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword'
        })

      expect(res.statusCode).toBe(401)
    })

    it('devrait refuser un email inexistant', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        })

      expect(res.statusCode).toBe(401)
    })
  })

  // ============ TESTS GET /me ============

  describe('GET /me', () => {
    it('devrait retourner l\'utilisateur connecté', async () => {
      const res = await request(app)
        .get('/me')
        .set('x-access-token', userToken)

      expect(res.statusCode).toBe(200)
      expect(res.body.email).toBe('user@test.com')
    })

    it('devrait refuser sans token', async () => {
      const res = await request(app).get('/me')

      expect(res.statusCode).toBe(403)
    })

    it('devrait refuser avec un token invalide', async () => {
      const res = await request(app)
        .get('/me')
        .set('x-access-token', 'invalid-token')

      expect(res.statusCode).toBe(403)
    })
  })

  // ============ TESTS GET /api/users ============

  describe('GET /api/users', () => {
    it('devrait lister tous les utilisateurs avec un token valide', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('x-access-token', userToken)

      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBeGreaterThanOrEqual(2)
    })

    it('devrait refuser sans token', async () => {
      const res = await request(app).get('/api/users')

      expect(res.statusCode).toBe(403)
    })
  })

  // ============ TESTS PUT /api/password ============

  describe('PUT /api/password', () => {
    it('devrait modifier le mot de passe avec l\'ancien mot de passe correct', async () => {
      const res = await request(app)
        .put('/api/password')
        .set('x-access-token', userToken)
        .send({
          password: 'user123',
          newPassword: 'newpassword123'
        })

      expect(res.statusCode).toBe(200)

      // Vérifier que le nouveau mot de passe fonctionne
      const loginRes = await request(app)
        .post('/login')
        .send({
          email: 'user@test.com',
          password: 'newpassword123'
        })
      expect(loginRes.statusCode).toBe(200)

      // Remettre l'ancien mot de passe pour les autres tests
      await request(app)
        .put('/api/password')
        .set('x-access-token', loginRes.body.token)
        .send({
          password: 'newpassword123',
          newPassword: 'user123'
        })
    })

    it('devrait refuser avec un ancien mot de passe incorrect', async () => {
      const res = await request(app)
        .put('/api/password')
        .set('x-access-token', userToken)
        .send({
          password: 'wrongpassword',
          newPassword: 'newpassword123'
        })

      expect(res.statusCode).toBe(401)
    })
  })

  // ============ TESTS ADMIN ============

  describe('PUT /api/users/:id (Admin)', () => {
    it('devrait permettre à un admin de modifier un utilisateur', async () => {
      const res = await request(app)
        .put(`/api/users/${normalUser.id}`)
        .set('x-access-token', adminToken)
        .send({ name: 'Updated Name' })

      expect(res.statusCode).toBe(200)
      expect(res.body.user.name).toBe('Updated Name')
    })

    it('devrait refuser à un non-admin de modifier un utilisateur', async () => {
      const res = await request(app)
        .put(`/api/users/${adminUser.id}`)
        .set('x-access-token', userToken)
        .send({ name: 'Hacked' })

      expect(res.statusCode).toBe(403)
    })
  })

  describe('DELETE /api/users/:id (Admin)', () => {
    it('devrait refuser à un non-admin de supprimer un utilisateur', async () => {
      const res = await request(app)
        .delete(`/api/users/${adminUser.id}`)
        .set('x-access-token', userToken)

      expect(res.statusCode).toBe(403)
    })

    it('devrait permettre à un admin de supprimer un utilisateur', async () => {
      // Créer un utilisateur à supprimer
      const toDelete = await User.create({
        name: 'To Delete',
        email: 'delete@test.com',
        passhash: await bcrypt.hash('password', 10),
        isAdmin: false
      })

      const res = await request(app)
        .delete(`/api/users/${toDelete.id}`)
        .set('x-access-token', adminToken)

      expect(res.statusCode).toBe(200)
    })
  })
})
