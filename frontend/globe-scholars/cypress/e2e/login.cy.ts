describe('Login', () => {

  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully and redirect to home page', () => {
    cy.get('input[formControlName="username"]').type('testuser0');
    cy.get('input[formControlName="password"]').type('TestPass123!');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:4200/');
  });

  it('should show error on wrong credentials', () => {
    cy.get('input[formControlName="username"]').type('testuser0');
    cy.get('input[formControlName="password"]').type('WrongPassword!');
    cy.get('button[type="submit"]').click();
    cy.get('.error').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('should show validation error when fields are empty', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Please fill in all fields').should('be.visible');
    cy.url().should('include', '/login');
  });
});
