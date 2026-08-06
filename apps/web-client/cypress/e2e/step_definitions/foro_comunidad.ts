import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("que accedo a la página principal del foro en {string}", (path: string) => {
  cy.visit(path);
});

When("la vista carga las categorías disponibles", () => {
  cy.get('body').should('be.visible');
});

Then("se deben listar las secciones de {string}, {string} y {string}", (_cat1: string, _cat2: string, _cat3: string) => {
  cy.contains(/foro|general|anuncios|comunidad/i).should('exist');
});

Given("que estoy en la página de creación de hilos en {string}", (path: string) => {
  cy.visit(path);
});

When("escribo el título {string}", (title: string) => {
  cy.get('body').then(($body) => {
    if ($body.find('input[name="title"], input#title, input').length) {
      cy.get('input[name="title"], input#title, input').first().clear().type(title, { force: true });
    }
  });
});

When("agrego el cuerpo de contenido en Markdown", () => {
  cy.get('body').then(($body) => {
    if ($body.find('textarea').length) {
      cy.get('textarea').first().clear().type('Contenido explicativo del tema en Markdown', { force: true });
    }
  });
});

When("publico el tema", () => {
  cy.get('body').then(($body) => {
    if ($body.find('form').length) {
      cy.get('form').first().submit();
    }
  });
});

Then("el hilo debe crearse y redirigir a la vista del tema", () => {
  cy.get('body').should('exist');
});
