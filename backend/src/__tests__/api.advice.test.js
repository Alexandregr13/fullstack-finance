const request = require('supertest')
const app = require('../app')
const db = require('../models/database')
const User = require('../models/users')
const Category = require('../models/categories')
const { Advice } = require('../models/advices')
const bcrypt = require('bcrypt')

describe('API Advice', () => {
  let adminToken
  let userToken
  let adminUser
  let normalUser
  let testCategory
  let testAdvice

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

    // Créer une catégorie de test
    testCategory = await Category.create({
      name: 'Test Category',
      level: 0
    })

    // Créer un conseil de test
    testAdvice = await Advice.create({
      title: 'Test Advice',
      summary: 'Test summary',
      content: 'Test content for the advice',
      investmentType: 'long_term',
      estimatedGain: 10,
      confidenceIndex: 80,
      authorId: adminUser.id
    })
    await testAdvice.addCategory(testCategory)

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

  // ============ TESTS GET /api/advices ============

  describe('GET /api/advices', () => {
    it('devrait lister les conseils', async () => {
      const res = await request(app).get('/api/advices')

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('advices')
      expect(res.body).toHaveProperty('pagination')
      expect(Array.isArray(res.body.advices)).toBe(true)
    })

    it('devrait supporter la pagination', async () => {
      const res = await request(app)
        .get('/api/advices')
        .query({ page: 1, limit: 5 })

      expect(res.statusCode).toBe(200)
      expect(res.body.pagination.page).toBe(1)
      expect(res.body.pagination.limit).toBe(5)
    })
  })

  // ============ TESTS GET /api/advices/latest ============

  describe('GET /api/advices/latest', () => {
    it('devrait retourner les derniers conseils', async () => {
      const res = await request(app).get('/api/advices/latest')

      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })
  })

  // ============ TESTS GET /api/advices/:id ============

  describe('GET /api/advices/:id', () => {
    it('devrait retourner un conseil par ID', async () => {
      const res = await request(app).get(`/api/advices/${testAdvice.id}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.title).toBe('Test Advice')
      expect(res.body).toHaveProperty('author')
      expect(res.body).toHaveProperty('categories')
    })

    it('devrait retourner 404 pour un ID inexistant', async () => {
      const res = await request(app).get('/api/advices/99999')

      expect(res.statusCode).toBe(404)
    })
  })

  // ============ TESTS POST /api/advices ============

  describe('POST /api/advices', () => {
    it('devrait créer un conseil avec un token valide', async () => {
      const res = await request(app)
        .post('/api/advices')
        .set('x-access-token', userToken)
        .send({
          title: 'New Advice',
          content: 'Content of the new advice',
          investmentType: 'short_term',
          estimatedGain: 5,
          categoryIds: [testCategory.id]
        })

      expect(res.statusCode).toBe(201)
      expect(res.body.title).toBe('New Advice')
      expect(res.body.author.id).toBe(normalUser.id)
    })

    it('devrait refuser sans titre', async () => {
      const res = await request(app)
        .post('/api/advices')
        .set('x-access-token', userToken)
        .send({
          content: 'Content without title'
        })

      expect(res.statusCode).toBe(400)
    })

    it('devrait refuser sans token', async () => {
      const res = await request(app)
        .post('/api/advices')
        .send({
          title: 'Unauthorized',
          content: 'Content'
        })

      expect(res.statusCode).toBe(403)
    })
  })

  // ============ TESTS PUT /api/advices/:id ============

  describe('PUT /api/advices/:id', () => {
    let userAdvice

    beforeAll(async () => {
      // Créer un conseil pour l'utilisateur normal
      userAdvice = await Advice.create({
        title: 'User Advice',
        content: 'Content by user',
        authorId: normalUser.id
      })
    })

    it('devrait permettre à l\'auteur de modifier son conseil', async () => {
      const res = await request(app)
        .put(`/api/advices/${userAdvice.id}`)
        .set('x-access-token', userToken)
        .send({ title: 'Updated User Advice' })

      expect(res.statusCode).toBe(200)
      expect(res.body.title).toBe('Updated User Advice')
    })

    it('devrait permettre à un admin de modifier tout conseil', async () => {
      const res = await request(app)
        .put(`/api/advices/${userAdvice.id}`)
        .set('x-access-token', adminToken)
        .send({ title: 'Admin Updated' })

      expect(res.statusCode).toBe(200)
    })

    it('devrait refuser à un autre utilisateur de modifier le conseil', async () => {
      // Créer un autre utilisateur
      const otherUser = await User.create({
        name: 'Other',
        email: 'other@test.com',
        passhash: await bcrypt.hash('other123', 10),
        isAdmin: false
      })

      const otherRes = await request(app)
        .post('/login')
        .send({ email: 'other@test.com', password: 'other123' })

      const res = await request(app)
        .put(`/api/advices/${userAdvice.id}`)
        .set('x-access-token', otherRes.body.token)
        .send({ title: 'Hacked' })

      expect(res.statusCode).toBe(403)
    })
  })

  // ============ TESTS DELETE /api/advices/:id ============

  describe('DELETE /api/advices/:id', () => {
    it('devrait permettre à l\'auteur de supprimer son conseil', async () => {
      // Créer un conseil à supprimer
      const toDelete = await Advice.create({
        title: 'To Delete',
        content: 'Will be deleted',
        authorId: normalUser.id
      })

      const res = await request(app)
        .delete(`/api/advices/${toDelete.id}`)
        .set('x-access-token', userToken)

      expect(res.statusCode).toBe(200)
    })

    it('devrait permettre à un admin de supprimer tout conseil', async () => {
      const toDelete = await Advice.create({
        title: 'Admin Delete',
        content: 'Content',
        authorId: normalUser.id
      })

      const res = await request(app)
        .delete(`/api/advices/${toDelete.id}`)
        .set('x-access-token', adminToken)

      expect(res.statusCode).toBe(200)
    })
  })

  // ============ TESTS SEARCH ============

  describe('GET /api/search', () => {
    it('devrait rechercher par mot-clé', async () => {
      const res = await request(app)
        .get('/api/search')
        .query({ q: 'Test' })

      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it('devrait filtrer par type', async () => {
      const res = await request(app)
        .get('/api/search')
        .query({ type: 'long_term' })

      expect(res.statusCode).toBe(200)
    })
  })
})
