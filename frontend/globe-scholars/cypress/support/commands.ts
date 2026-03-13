/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

declare namespace Cypress {
  interface Chainable {
    login(username: string, password: string): void
  }
}

Cypress.Commands.add('login', (username, password) => {
  cy.request('POST', 'http://localhost:8001/api/auth/login/', { username, password })
    .then((response) => {
      cy.window().then((win) => {
        win.sessionStorage.setItem('access_token', response.body.tokens.access);
        win.sessionStorage.setItem('refresh_token', response.body.tokens.refresh);
        win.sessionStorage.setItem('username', username);
      });
    });
});
