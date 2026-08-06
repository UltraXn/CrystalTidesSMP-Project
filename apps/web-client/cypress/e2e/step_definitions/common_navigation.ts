import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("que navego a la página principal en {string}", (path: string) => {
  cy.visit(path);
});

Given("navego a la página principal en {string}", (path: string) => {
  cy.visit(path);
});

Given("que navego a la página de reglas en {string}", (path: string) => {
  cy.visit(path);
});

Given("navego a la página de reglas en {string}", (path: string) => {
  cy.visit(path);
});
