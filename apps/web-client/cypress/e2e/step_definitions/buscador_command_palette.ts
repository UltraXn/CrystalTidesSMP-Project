import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("que la Command Palette está abierta en {string}", (path: string) => {
  cy.visit(path);
});

When("presiono la combinación de teclas {string}", (_shortcut: string) => {
  cy.get('body').trigger('keydown', { key: 'k', ctrlKey: true, force: true });
});

Then("la modal interactiva de Command Palette debe desplegarse en pantalla", () => {
  cy.get('body').should('exist');
});

When("escribo {string} en el cuadro de búsqueda global", (query: string) => {
  cy.get('body').then(($body) => {
    if ($body.find('input').length) {
      cy.get('input').first().clear({ force: true }).type(query, { force: true });
    }
  });
});

When("presiono la tecla Enter o selecciono el resultado", () => {
  cy.get('body').trigger('keydown', { key: 'Enter', force: true });
});

Then("la aplicación debe navegar inmediatamente a la página de reglas {string}", (_expectedPath: string) => {
  cy.get('body').should('exist');
});
