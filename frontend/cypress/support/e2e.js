// Commandes personnalisées Cypress

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/#/login')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="submit-button"]').click()
})

Cypress.Commands.add('register', (name, email, password) => {
  cy.visit('/#/login')
  cy.contains('S\'inscrire').click()
  cy.get('[data-testid="name-input"]').type(name)
  cy.get('[data-testid="register-email-input"]').type(email)
  cy.get('[data-testid="register-password-input"]').type(password)
  cy.get('[data-testid="confirm-password-input"]').type(password)
  cy.get('[data-testid="register-submit"]').click()
})

// Intercepter les requêtes API pour les tests
Cypress.Commands.add('mockApi', () => {
  cy.intercept('GET', '/api/advices/latest', { fixture: 'advices.json' }).as('getLatestAdvices')
  cy.intercept('GET', '/api/categories', { fixture: 'categories.json' }).as('getCategories')
})
