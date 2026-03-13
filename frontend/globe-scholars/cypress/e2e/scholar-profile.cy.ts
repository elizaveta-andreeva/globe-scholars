describe('ScholarProfileComponent', () => {

  describe('Without login', () => {
    it('should display scholar profile', () => {
      cy.visit('/home/scholars/1');
      cy.get('.profile-hero').should('be.visible');
    });

    it('should display scholar name', () => {
      cy.visit('/home/scholars/1');
      cy.get('.scholar-name').should('not.be.empty');
    });

    it('should display scholar meta tags', () => {
      cy.visit('/home/scholars/1');
      cy.get('.meta-tags').should('be.visible');
    });

    it('should display works section', () => {
      cy.visit('/home/scholars/1');
      cy.get('.works-section').should('be.visible');
    });

    it('should display stats section', () => {
      cy.visit('/home/scholars/1');
      cy.get('.stats-section').should('be.visible');
    });

    it('should copy profile link on share button click', () => {
      cy.visit('/home/scholars/1');
      cy.window().then((win) => {
        cy.stub(win.navigator.clipboard, 'writeText').resolves();
      });
      cy.get('.action-btn--outline').click();
      cy.get('.copied-text').should('be.visible');
    });

    it('should show error for non-existent scholar', () => {
      cy.intercept('GET', '/api/auth/scholars/99999/', {
        statusCode: 404,
        body: { detail: 'Not found.' }
      });
      cy.visit('/home/scholars/99999');
      cy.get('.state-message.error').should('contain', 'Failed to load scholar profile');
    });
  });

  describe('Viewing own profile', () => {
    beforeEach(() => {
      cy.visit('/home/scholars/1');
      cy.login('testuser', 'TestPass123!');
      cy.reload();
    });

    it('should show works list', () => {
      cy.get('.works-list .work-card').should('have.length.greaterThan', 0);
    });

    it('should navigate to work on Open click', () => {
      cy.get('.work-card button').contains('Open').first().click();
      cy.url().should('include', '/home/repository/');
    });
  });

  describe('Viewing other user profile', () => {
    beforeEach(() => {
      cy.visit('/home/scholars/2');
      cy.login('testuser', 'TestPass123!');
      cy.reload();
    });

    it('should show Open button on other users works', () => {
      cy.get('.works-list').then(($list) => {
        if ($list.find('.work-card').length > 0) {
          cy.get('.work-card button').contains('Open').should('be.visible');
        }
      });
    });
  });
});
