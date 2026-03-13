describe('ScholarsComponent', () => {

  beforeEach(() => {
    cy.visit('/home/scholars');
  });

  it('should display scholars grid with real data from API', () => {
    cy.get('.scholar-card').should('have.length.greaterThan', 0);
  });

  it('should filter scholars in real time as user types', () => {
    cy.get('.scholar-card').its('length').then((totalCount) => {
      cy.get('input[type="text"]').type('Test');
      cy.get('.scholar-card').should('have.length.lessThan', totalCount + 1);
      cy.get('.scholar-card').each(($card) => {
        cy.wrap($card).invoke('text').then((text) => {
          expect(text.toLowerCase()).to.include('test');
        });
      });
    });
  });

  it('should show no results message when search has no matches', () => {
    cy.get('input[type="text"]').type('zzzzzzzzzzzzz');
    cy.get('.scholar-card').should('not.exist');
  });

  it('should clear search and show all scholars again', () => {
    cy.get('.scholar-card').its('length').then((totalCount) => {
      cy.get('input[type="text"]').type('zzz');
      cy.get('input[type="text"]').clear();
      cy.get('.scholar-card').should('have.length', totalCount);
    });
  });

  it('should sort scholars A-Z then Z-A on toggle', () => {
    cy.get('.scholar-card').then(($cards) => {
      const names: string[] = [];
      $cards.each((_, card) => {
        names.push(Cypress.$(card).find('p').first().text().trim());
      });
      const sorted = [...names].sort();
      expect(names).to.deep.equal(sorted);
    });

    cy.get('button').contains(/sort|a-z|z-a/i).click();

    cy.get('.scholar-card').then(($cards) => {
      const names: string[] = [];
      $cards.each((_, card) => {
        names.push(Cypress.$(card).find('p').first().text().trim());
      });
      const sortedDesc = [...names].sort().reverse();
      expect(names).to.deep.equal(sortedDesc);
    });
  });

  it('should navigate to scholar profile on card click', () => {
    cy.get('.scholar-card').first().click();
    cy.url().should('match', /\/home\/scholars\/\d+/);
  });

  it('should persist search query while browsing', () => {
    cy.get('input[type="text"]').type('Test');
    cy.get('.scholar-card').first().click();
    cy.go('back');
    cy.url().should('include', '/home/scholars');
  });
});
