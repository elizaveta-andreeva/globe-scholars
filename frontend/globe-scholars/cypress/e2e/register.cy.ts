describe('Register', () => {

  beforeEach(() => {
    cy.visit('/register');
  });

  it('should register new user and redirect to login', () => {
    const username = `user_${Date.now()}`;
    cy.get('input[formControlName="first_name"]').type('New');
    cy.get('input[formControlName="last_name"]').type('User');
    cy.get('input[formControlName="username"]').type(username);
    cy.get('input[formControlName="password"]').type('TestPass123!');
    cy.get('input[formControlName="password2"]').type('TestPass123!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
  });

  it('should show error when username already exists', () => {
    cy.get('input[formControlName="first_name"]').type('Test');
    cy.get('input[formControlName="last_name"]').type('User');
    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('input[formControlName="password"]').type('TestPass123!');
    cy.get('input[formControlName="password2"]').type('TestPass123!');
    cy.get('button[type="submit"]').click();
    cy.get('.error').should('be.visible');
    cy.url().should('include', '/register');
  });

  it('should be able to login after registration', () => {
    const username = `user_${Date.now()}`;
    cy.get('input[formControlName="first_name"]').type('New');
    cy.get('input[formControlName="last_name"]').type('User');
    cy.get('input[formControlName="username"]').type(username);
    cy.get('input[formControlName="password"]').type('TestPass123!');
    cy.get('input[formControlName="password2"]').type('TestPass123!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
    cy.get('input[formControlName="username"]').type(username);
    cy.get('input[formControlName="password"]').type('TestPass123!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/home');
  });

  it('should show validation error on empty submit', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Please fill in all the fields').should('be.visible');
  });
});
