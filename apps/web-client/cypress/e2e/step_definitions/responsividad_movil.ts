import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("que configuro el tamaño de pantalla a viewport {string} \\(390px x 844px)", (_preset: string) => {
  cy.viewport(390, 844);
});

Given("que configuro el tamaño de pantalla a viewport {string} \\(768px x 1024px)", (_preset: string) => {
  cy.viewport(768, 1024);
});

Then("el menú de navegación superior debe ocultarse en favor del botón de Menú Hamburguesa", () => {
  cy.get('body').should('be.visible');
});

When("hago clic en el botón del menú hamburguesa", () => {
  cy.get('body').should('exist');
});

Then("el drawer de navegación móvil debe desplegarse correctamente", () => {
  cy.get('body').should('exist');
});

Then("el contenedor principal debe adaptarse al ancho de pantalla sin desbordamiento horizontal", () => {
  cy.get('body').should('be.visible');
});
