
describe('FileViewComponent', () => {

  describe('Without login', () => {
    it('should redirect to login when not authenticated', () => {
      cy.visit('/home/repository/1');
      cy.url().should('include', '/login');
    });
  });

  describe('With login', () => {
    beforeEach(() => {
      cy.visit('/home/repository');
      cy.login('testuser', 'TestPass123!');
      cy.reload();
    });

    it('should navigate to file view on Open click', () => {
      cy.get('.grid-footer button').contains('Open').first().click();
      cy.url().should('include', '/home/repository/');
    });

    it('should display work title', () => {
      cy.visit('/home/repository/1');
      cy.get('.header h1').should('be.visible');
      cy.get('.header h1').invoke('text').should('not.be.empty');
    });

    it('should display work metadata', () => {
      cy.visit('/home/repository/1');
      cy.get('.meta-row').should('have.length.greaterThan', 0);
    });

    it('should display PDF viewer', () => {
      cy.visit('/home/repository/1');
      cy.get('pdf-viewer', { timeout: 10000 }).should('exist');
    });

    it('should display author info in sidebar', () => {
      cy.visit('/home/repository/1');
      cy.get('.author-card').should('be.visible');
      cy.get('.author-card h2').should('not.be.empty');
    });

    it('should show reaction count', () => {
      cy.visit('/home/repository/1');
      cy.get('.footer h4').should('contain', 'Count:');
    });

    it('should show error when work not found', () => {
      cy.intercept('GET', '/api/repository/99999/', {
        statusCode: 404,
        body: { detail: 'Not found.' }
      });
      cy.visit('/home/repository/99999');
      cy.get('.state-message.error').should('contain', 'Failed to load work details');
    });

    it('should show error when PDF fails to load', () => {
      cy.intercept('GET', '/api/repository/1/download/', {
        statusCode: 500,
        body: {}
      });
      cy.visit('/home/repository/1');
      cy.get('.state-message.error').should('contain', 'Failed to load file');
    });
  });
});
