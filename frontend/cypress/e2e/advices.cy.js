describe('Conseils d\'investissement', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/advices/latest', { fixture: 'advices.json' }).as('getAdvices')
    cy.intercept('GET', '/api/categories', { fixture: 'categories.json' }).as('getCategories')
  })

  describe('Page d\'accueil', () => {
    it('devrait afficher les derniers conseils', () => {
      cy.visit('/')
      cy.wait('@getAdvices')
      cy.contains('Investir dans les tech stocks').should('be.visible')
      cy.contains('Opportunité sur le marché crypto').should('be.visible')
    })

    it('devrait afficher les catégories', () => {
      cy.visit('/')
      cy.wait('@getCategories')
      cy.contains('Actions').should('be.visible')
      cy.contains('Crypto').should('be.visible')
    })

    it('devrait naviguer vers le détail d\'un conseil', () => {
      cy.intercept('GET', '/api/advices/1', {
        id: 1,
        title: 'Investir dans les tech stocks',
        content: 'Détails complets...',
        author: { id: 1, name: 'John Doe' },
        categories: []
      })

      cy.visit('/')
      cy.wait('@getAdvices')
      cy.contains('Investir dans les tech stocks').click()
      cy.url().should('include', '/advice/1')
    })
  })

  describe('Détail d\'un conseil', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/advices/1', {
        id: 1,
        title: 'Investir dans les tech stocks',
        summary: 'Les valeurs technologiques restent prometteuses',
        content: 'Analyse détaillée des opportunités dans le secteur tech...',
        investmentType: 'long_term',
        estimatedGain: 15.5,
        confidenceIndex: 75,
        assets: ['AAPL', 'MSFT'],
        author: { id: 1, name: 'John Doe' },
        categories: [{ id: 1, name: 'Actions' }]
      }).as('getAdvice')
    })

    it('devrait afficher les détails du conseil', () => {
      cy.visit('/#/advice/1')
      cy.wait('@getAdvice')
      cy.contains('Investir dans les tech stocks').should('be.visible')
      cy.contains('15.5%').should('be.visible')
      cy.contains('75%').should('be.visible')
      cy.contains('AAPL').should('be.visible')
    })
  })

  describe('Recherche', () => {
    it('devrait permettre de rechercher des conseils', () => {
      cy.intercept('GET', '/api/search*', { fixture: 'advices.json' }).as('search')
      cy.intercept('GET', '/api/categories/flat', []).as('getFlatCategories')

      cy.visit('/#/search')
      cy.get('input[name="q"]').type('tech')
      cy.contains('Rechercher').click()
      cy.wait('@search')
      cy.contains('Investir dans les tech stocks').should('be.visible')
    })

    it('devrait permettre de filtrer par type', () => {
      cy.intercept('GET', '/api/search*', { fixture: 'advices.json' }).as('search')
      cy.intercept('GET', '/api/categories/flat', []).as('getFlatCategories')

      cy.visit('/#/search')
      cy.get('select[name="type"]').select('long_term')
      cy.contains('Rechercher').click()
      cy.wait('@search')
    })
  })

  describe('Création de conseil (authentifié)', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'fake-token')
      })

      cy.intercept('GET', '/me', {
        id: 1, name: 'Test User', email: 'test@example.com', isAdmin: false
      })

      cy.intercept('GET', '/api/categories/flat', [
        { id: 1, name: 'Actions', level: 0 },
        { id: 2, name: 'Crypto', level: 0 }
      ])
    })

    it('devrait afficher le formulaire de création', () => {
      cy.visit('/#/create-advice')
      cy.contains('Créer un conseil').should('be.visible')
      cy.get('input#title').should('be.visible')
      cy.get('textarea#content').should('be.visible')
    })

    it('devrait créer un nouveau conseil', () => {
      cy.intercept('POST', '/api/advices', {
        statusCode: 201,
        body: { id: 3, title: 'Mon nouveau conseil' }
      }).as('createAdvice')

      cy.intercept('GET', '/api/advices/3', {
        id: 3,
        title: 'Mon nouveau conseil',
        content: 'Contenu du conseil',
        author: { name: 'Test User' },
        categories: []
      })

      cy.visit('/#/create-advice')
      cy.get('input#title').type('Mon nouveau conseil')
      cy.get('textarea#content').type('Contenu du conseil')
      cy.get('select#investmentType').select('short_term')
      cy.contains('Publier le conseil').click()

      cy.wait('@createAdvice')
      cy.url().should('include', '/advice/3')
    })
  })
})
