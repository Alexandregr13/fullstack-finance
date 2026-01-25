describe('Authentification', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Inscription', () => {
    it('devrait afficher le formulaire d\'inscription', () => {
      cy.visit('/#/login')
      cy.contains('S\'inscrire').click()
      cy.get('[data-testid="register-form"]').should('be.visible')
    })

    it('devrait valider les champs obligatoires', () => {
      cy.visit('/#/login')
      cy.contains('S\'inscrire').click()
      cy.get('[data-testid="register-submit"]').click()
      // Le formulaire ne devrait pas être soumis car les champs sont vides
      cy.get('[data-testid="register-form"]').should('be.visible')
    })

    it('devrait valider le format de l\'email', () => {
      cy.visit('/#/login')
      cy.contains('S\'inscrire').click()
      cy.get('[data-testid="name-input"]').type('Test User')
      cy.get('[data-testid="register-email-input"]').type('invalid-email')
      cy.get('[data-testid="register-password-input"]').type('password123')
      cy.get('[data-testid="confirm-password-input"]').type('password123')
      cy.get('[data-testid="register-submit"]').click()
      cy.get('[data-testid="register-error"]').should('contain', 'Email invalide')
    })

    it('devrait valider que les mots de passe correspondent', () => {
      cy.visit('/#/login')
      cy.contains('S\'inscrire').click()
      cy.get('[data-testid="name-input"]').type('Test User')
      cy.get('[data-testid="register-email-input"]').type('test@example.com')
      cy.get('[data-testid="register-password-input"]').type('password123')
      cy.get('[data-testid="confirm-password-input"]').type('different')
      cy.get('[data-testid="register-submit"]').click()
      cy.get('[data-testid="register-error"]').should('contain', 'ne correspondent pas')
    })
  })

  describe('Connexion', () => {
    it('devrait afficher le formulaire de connexion', () => {
      cy.visit('/#/login')
      cy.get('[data-testid="login-form"]').should('be.visible')
    })

    it('devrait valider le format de l\'email', () => {
      cy.visit('/#/login')
      cy.get('[data-testid="email-input"]').type('invalid')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="submit-button"]').click()
      cy.get('[data-testid="error-message"]').should('contain', 'Email invalide')
    })

    it('devrait afficher une erreur pour des identifiants incorrects', () => {
      cy.intercept('POST', '/login', {
        statusCode: 401,
        body: { error: 'Email ou mot de passe incorrect' }
      })

      cy.visit('/#/login')
      cy.get('[data-testid="email-input"]').type('wrong@example.com')
      cy.get('[data-testid="password-input"]').type('wrongpassword')
      cy.get('[data-testid="submit-button"]').click()
      cy.get('[data-testid="error-message"]').should('be.visible')
    })

    it('devrait rediriger vers l\'accueil après connexion réussie', () => {
      cy.intercept('POST', '/login', {
        statusCode: 200,
        body: {
          token: 'fake-jwt-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com', isAdmin: false }
        }
      })

      cy.intercept('GET', '/me', {
        statusCode: 200,
        body: { id: 1, name: 'Test User', email: 'test@example.com', isAdmin: false }
      })

      cy.intercept('GET', '/api/advices/latest', [])
      cy.intercept('GET', '/api/categories', [])

      cy.visit('/#/login')
      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="submit-button"]').click()

      cy.url().should('include', '/#/')
      cy.contains('Test User').should('be.visible')
    })
  })

  describe('Déconnexion', () => {
    it('devrait déconnecter l\'utilisateur', () => {
      // Simuler un utilisateur connecté
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'fake-token')
      })

      cy.intercept('GET', '/me', {
        statusCode: 200,
        body: { id: 1, name: 'Test User', email: 'test@example.com', isAdmin: false }
      })

      cy.intercept('GET', '/api/advices/latest', [])
      cy.intercept('GET', '/api/categories', [])

      cy.visit('/')
      cy.contains('Déconnexion').click()
      cy.contains('Connexion').should('be.visible')
    })
  })
})
