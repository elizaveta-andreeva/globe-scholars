describe('UserProfileComponent', () => {

  beforeEach(() => {
    cy.login('testuser', 'TestPass123!');
    cy.visit('/home/profile');
    cy.reload();
  });

  it('should display real profile data loaded from API', () => {
    cy.get('.profile-page').should('be.visible');
    cy.get('.profile-name').should('contain', 'User');
  });

  it('should edit and save profile with real API call', () => {
    cy.get('.btn-primary').contains('Edit Profile').click();
    cy.get('input[placeholder="First name"]').clear().type('UpdatedName');
    cy.get('.btn-primary').contains('Save Changes').click();
    cy.get('.notification').should('contain', 'Profile updated successfully!');
    cy.get('.profile-name').should('contain', 'UpdatedName');
  });

  it('should persist profile changes after page reload', () => {
    cy.get('.btn-primary').contains('Edit Profile').click();
    const newBio = `Bio updated at ${Date.now()}`;
    cy.get('textarea[placeholder="Bio..."]').clear().type(newBio);
    cy.get('.btn-primary').contains('Save Changes').click();
    cy.get('.notification').should('contain', 'Profile updated successfully!');
    cy.reload();
    cy.get('.bio-box').should('contain', newBio);
  });

  it('should cancel editing and revert changes', () => {
    cy.get('.detail-value').first().invoke('text').then((originalText) => {
      cy.get('.btn-primary').contains('Edit Profile').click();
      cy.get('input[placeholder="First name"]').clear().type('ShouldNotSave');
      cy.get('.btn-outline').contains('Cancel').click();
      cy.get('.detail-value').first().should('contain', originalText.trim());
    });
  });

  it('should show error when passwords do not match', () => {
    cy.get('.btn-outline').contains('Change Password').click();
    cy.get('input[formControlName="old_password"]').type('TestPass123!');
    cy.get('input[formControlName="new_password"]').type('NewPass456!');
    cy.get('input[formControlName="new_password2"]').type('DifferentPass789!');
    cy.get('.btn-primary').contains('Save').click();
    cy.get('.error-msg').should('contain', 'Passwords do not match');
  });

  it('should copy profile link to clipboard', () => {
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').resolves();
    });
    cy.get('.btn-outline').contains('Share Profile').click();
    cy.get('.notification').should('contain', 'Link copied!');
  });

  it('should logout and redirect to login page', () => {
    cy.get('.btn-danger').contains('Log Out').click();
    cy.url().should('include', '/login');
  });
});
