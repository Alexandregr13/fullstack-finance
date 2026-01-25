describe('Administration', () => {
  beforeEach(() => {
    // Simuler un admin connecté
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'admin-token')
    })

    cy.intercept('GET', '/me', {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      isAdmin: true
    })

    cy.intercept('GET', '/api/users', [
      { id: 1, name: 'Admin User', email: 'admin@example.com', isAdmin: true },
      { id: 2, name: 'Regular User', email: 'user@example.com', isAdmin: false }
    ]).as('getUsers')

    cy.intercept('GET', '/api/categories/flat', [
      { id: 1, name: 'Actions', level: 0 },
      { id: 2, name: 'Crypto', level: 0 }
    ]).as('getCategories')

    cy.intercept('GET', '/api/advices/latest', [])
    cy.intercept('GET', '/api/categories', [])
  })

  it('devrait afficher le panneau admin pour les administrateurs', () => {
    cy.visit('/#/admin')
    cy.contains('Administration').should('be.visible')
  })

  describe('Gestion des utilisateurs', () => {
    it('devrait lister les utilisateurs', () => {
      cy.visit('/#/admin')
      cy.wait('@getUsers')
      cy.contains('Admin User').should('be.visible')
      cy.contains('Regular User').should('be.visible')
    })

    it('devrait pouvoir changer le rôle admin', () => {
      cy.intercept('PUT', '/api/users/2', {
        statusCode: 200,
        body: { message: 'Utilisateur mis à jour', user: { id: 2, name: 'Regular User', isAdmin: true } }
      }).as('updateUser')

      cy.visit('/#/admin')
      cy.wait('@getUsers')
      // Cliquer sur la checkbox admin du second utilisateur
      cy.get('table tbody tr').eq(1).find('input[type="checkbox"]').click()
      cy.wait('@updateUser')
    })

    it('devrait pouvoir supprimer un utilisateur', () => {
      cy.intercept('DELETE', '/api/users/2', {
        statusCode: 200,
        body: { message: 'Utilisateur supprimé' }
      }).as('deleteUser')

      cy.visit('/#/admin')
      cy.wait('@getUsers')
      cy.get('table tbody tr').eq(1).contains('Supprimer').click()
      cy.wait('@deleteUser')
    })
  })

  describe('Gestion des catégories', () => {
    it('devrait lister les catégories', () => {
      cy.visit('/#/admin')
      cy.contains('Catégories').click()
      cy.wait('@getCategories')
      cy.contains('Actions').should('be.visible')
      cy.contains('Crypto').should('be.visible')
    })

    it('devrait pouvoir créer une catégorie', () => {
      cy.intercept('POST', '/api/categories', {
        statusCode: 201,
        body: { id: 3, name: 'Nouvelle catégorie', level: 0 }
      }).as('createCategory')

      cy.visit('/#/admin')
      cy.contains('Catégories').click()
      cy.get('.create-form input').type('Nouvelle catégorie')
      cy.get('.create-form button[type="submit"]').click()
      cy.wait('@createCategory')
    })

    it('devrait pouvoir supprimer une catégorie', () => {
      cy.intercept('DELETE', '/api/categories/2', {
        statusCode: 200,
        body: { message: 'Catégorie supprimée' }
      }).as('deleteCategory')

      cy.visit('/#/admin')
      cy.contains('Catégories').click()
      cy.wait('@getCategories')
      cy.get('table tbody tr').eq(1).contains('Supprimer').click()
      cy.wait('@deleteCategory')
    })
  })
})

describe('Accès non-admin', () => {
  it('devrait rediriger les non-admins vers l\'accueil', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'user-token')
    })

    cy.intercept('GET', '/me', {
      id: 2,
      name: 'Regular User',
      email: 'user@example.com',
      isAdmin: false
    })

    cy.intercept('GET', '/api/advices/latest', [])
    cy.intercept('GET', '/api/categories', [])

    cy.visit('/#/admin')
    cy.url().should('not.include', '/admin')
  })
})
