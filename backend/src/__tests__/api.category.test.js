const request = require('supertest')
const app = require('../app')
const db = require('../models/database')
const User = require('../models/users')
const Category = require('../models/categories')
const bcrypt = require('bcrypt')

describe('API Category', () => {
  let adminToken
  let userToken
  let testCategory

  beforeAll(async () => {
    await db.sync({ force: true })

    // Créer un admin
    const adminHash = await bcrypt.hash('admin123', 10)
    await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      passhash: adminHash,
      isAdmin: true
    })

    // Créer un utilisateur normal
    const userHash = await bcrypt.hash('user123', 10)
    await User.create({
      name: 'User',
      email: 'user@test.com',
      passhash: userHash,
      isAdmin: false
    })

    // Créer des catégories de test
    testCategory = await Category.create({
      name: 'Root Category',
      description: 'A root category',
      level: 0
    })

    await Category.create({
      name: 'Child Category',
      description: 'A child category',
      parentId: testCategory.id,
      level: 1
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

  // ============ TESTS GET /api/categories ============

  describe('GET /api/categories', () => {
    it('devrait retourner l\'arbre des catégories', async () => {
      const res = await request(app).get('/api/categories')

      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body[0]).toHaveProperty('children')
    })
  })

  // ============ TESTS GET /api/categories/flat ============

  describe('GET /api/categories/flat', () => {
    it('devrait retourner la liste plate des catégories', async () => {
      const res = await request(app).get('/api/categories/flat')

      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })
  })

  // ============ TESTS GET /api/categories/:id ============

  describe('GET /api/categories/:id', () => {
    it('devrait retourner une catégorie par ID', async () => {
      const res = await request(app).get(`/api/categories/${testCategory.id}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.name).toBe('Root Category')
    })

    it('devrait retourner 404 pour un ID inexistant', async () => {
      const res = await request(app).get('/api/categories/99999')

      expect(res.statusCode).toBe(404)
    })
  })

  // ============ TESTS POST /api/categories (Admin) ============

  describe('POST /api/categories', () => {
    it('devrait permettre à un admin de créer une catégorie', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('x-access-token', adminToken)
        .send({
          name: 'New Category',
          description: 'A new category'
        })

      expect(res.statusCode).toBe(201)
      expect(res.body.name).toBe('New Category')
      expect(res.body.level).toBe(0)
    })

    it('devrait créer une sous-catégorie avec le bon niveau', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('x-access-token', adminToken)
        .send({
          name: 'Sub Category',
          parentId: testCategory.id
        })

      expect(res.statusCode).toBe(201)
      expect(res.body.level).toBe(1)
      expect(res.body.parentId).toBe(testCategory.id)
    })

    it('devrait refuser à un non-admin de créer une catégorie', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('x-access-token', userToken)
        .send({
          name: 'Unauthorized Category'
        })

      expect(res.statusCode).toBe(403)
    })

    it('devrait refuser sans nom', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('x-access-token', adminToken)
        .send({
          description: 'No name'
        })

      expect(res.statusCode).toBe(400)
    })
  })

  // ============ TESTS PUT /api/categories/:id (Admin) ============

  describe('PUT /api/categories/:id', () => {
    it('devrait permettre à un admin de modifier une catégorie', async () => {
      const res = await request(app)
        .put(`/api/categories/${testCategory.id}`)
        .set('x-access-token', adminToken)
        .send({ name: 'Updated Root Category' })

      expect(res.statusCode).toBe(200)
      expect(res.body.name).toBe('Updated Root Category')
    })

    it('devrait refuser de définir une catégorie comme son propre parent', async () => {
      const res = await request(app)
        .put(`/api/categories/${testCategory.id}`)
        .set('x-access-token', adminToken)
        .send({ parentId: testCategory.id })

      expect(res.statusCode).toBe(400)
    })

    it('devrait refuser à un non-admin de modifier une catégorie', async () => {
      const res = await request(app)
        .put(`/api/categories/${testCategory.id}`)
        .set('x-access-token', userToken)
        .send({ name: 'Hacked' })

      expect(res.statusCode).toBe(403)
    })
  })

  // ============ TESTS DELETE /api/categories/:id (Admin) ============

  describe('DELETE /api/categories/:id', () => {
    it('devrait refuser de supprimer une catégorie avec des enfants', async () => {
      const res = await request(app)
        .delete(`/api/categories/${testCategory.id}`)
        .set('x-access-token', adminToken)

      expect(res.statusCode).toBe(400)
    })

    it('devrait permettre de supprimer une catégorie sans enfants', async () => {
      // Créer une catégorie à supprimer
      const toDelete = await Category.create({
        name: 'To Delete',
        level: 0
      })

      const res = await request(app)
        .delete(`/api/categories/${toDelete.id}`)
        .set('x-access-token', adminToken)

      expect(res.statusCode).toBe(200)
    })

    it('devrait refuser à un non-admin de supprimer une catégorie', async () => {
      const toDelete = await Category.create({
        name: 'Protected',
        level: 0
      })

      const res = await request(app)
        .delete(`/api/categories/${toDelete.id}`)
        .set('x-access-token', userToken)

      expect(res.statusCode).toBe(403)
    })
  })
})
