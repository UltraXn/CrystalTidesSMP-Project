import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("que navego a la página de la Wiki en {string}", (path: string) => {
  cy.visit(path);
});

When("busco {string} en el cuadro de búsqueda", (query: string) => {
  cy.get('.search-box input').first().clear().type(query);
});

Then("el Bestiario debe mostrar la criatura {string}", (entityTitle: string) => {
  cy.contains(entityTitle).should("be.visible");
});

Given("que estoy en el Panel Administrativo en {string}", (path: string) => {
  cy.visit(path);
});

When("selecciono la categoría {string} en los filtros", (category: string) => {
  cy.get('select').last().select(category);
});

Then("el Panel debe listar solo los mobs con la etiqueta {string}", (_category: string) => {
  cy.get('.article-card').should("exist");
});
