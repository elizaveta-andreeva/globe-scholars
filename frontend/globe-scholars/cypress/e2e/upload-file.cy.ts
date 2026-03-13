describe('UploadWorkComponent', () => {

  beforeEach(() => {
    cy.login('testuser', 'TestPass123!');
    cy.visit('/home/upload');
    cy.reload();
  });

  it('should show validation errors on empty submit', () => {
    cy.get('button[type="submit"]').click();
    cy.get('.invalid').should('have.length.greaterThan', 0);
  });

  it('should show file required error when submitting without file', () => {
    cy.get('input[formControlName="title"]').type('Test Title');
    cy.get('input[formControlName="publicationDate"]').type('2024-01-01');
    cy.get('button[type="submit"]').click();
    cy.contains('File is required').should('be.visible');
  });

  it('should reject invalid file type', () => {
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('fake content'),
      fileName: 'test.txt',
      mimeType: 'text/plain'
    }, { force: true });
    cy.contains('Only .pdf and .docx files are allowed').should('be.visible');
  });

  it('should accept PDF file', () => {
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('fake pdf'),
      fileName: 'test.pdf',
      mimeType: 'application/pdf'
    }, { force: true });
    cy.contains('Only .pdf and .docx files are allowed').should('not.exist');
  });

  it('should add and remove author fields', () => {
    cy.get('.author-row').should('have.length', 1);
    cy.get('button.primary-btn').contains('Add Author').click();
    cy.get('.author-row').should('have.length', 2);
    cy.get('button.secondary-btn').contains('Remove Author').first().click();
    cy.get('.author-row').should('have.length', 1);
  });
});
