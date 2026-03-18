/// <reference types="cypress" />

describe('Repository Page', () => {

  describe('Without login', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4200/repository');
    });

    it('should display the repository page', () => {
      cy.get('.file-container').should('be.visible');
    });

    it('should display works list', () => {
      cy.get('.file-card').should('have.length.greaterThan', 0);
    });

    it('should show login modal when clicking Open without login', () => {
      cy.get('.grid-footer button').first().click();
      cy.get('.modal-overlay').should('be.visible');
      cy.get('.modal h3').should('contain', 'Login Required');
    });

    it('should close modal on cancel', () => {
      cy.get('.grid-footer button').first().click();
      cy.get('.modal-overlay').should('be.visible');
      cy.get('.modal-actions button').contains('Cancel').click();
      cy.get('.modal-overlay').should('not.exist');
    });

    it('should not show Download button when not logged in', () => {
      cy.get('.grid-footer').each(($footer) => {
        cy.wrap($footer).find('button').should('have.length', 1);
        cy.wrap($footer).find('button').should('contain', 'Open');
      });
    });

    it('should filter works by Last Year', () => {
      cy.get('.filter-btns button').contains('Last Year').click();
      cy.get('.filter-btns button').contains('Last Year').should('have.class', 'active');
    });

    it('should filter works by All Time', () => {
      cy.get('.filter-btns button').contains('All Time').click();
      cy.get('.file-card').should('have.length.greaterThan', 0);
    });

    it('should display scholars in sidebar', () => {
      cy.get('.scholars-list .scholar-row').should('have.length.greaterThan', 0);
    });

    it('should show No works found when search has no results', () => {
      cy.get('input[placeholder="Search by name..."]').type('xxxxxxxxxxx');
      cy.get('.state-message').should('contain', 'No works found');
    });
  });

  describe('With login', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4200/repository');
      cy.login('testuser0', 'TestPass123!');
      cy.reload();
    });

    it('should show Download button when logged in', () => {
      cy.get('.grid-footer button').contains('Download').should('be.visible');
    });

    it('should navigate to work on Open click', () => {
      cy.get('.grid-footer button').contains('Open').first().click();
      cy.url().should('include', '/repository/');
    });
  });
});
