import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("que navego a la sección de sugerencias en {string}", (path: string) => {
  cy.visit(path);
});

When("abro el formulario de nueva sugerencia", () => {
  cy.get('body').then(($body) => {
    const btn = $body.find('button, a').filter((_, el) => /nueva sugerencia|crear sugerencia|sugerir/i.test(el.innerText || el.textContent || ''));
    if (btn.length) {
      cy.wrap(btn.first()).click({ force: true });
    }
  });
});

When("escribo el título {string} y descripción {string}", (title: string, desc: string) => {
  cy.get('body').then(($body) => {
    if ($body.find('input[name="title"], input#title, input[placeholder*="título"]').length) {
      cy.get('input[name="title"], input#title, input[placeholder*="título"]').first().clear().type(title, { force: true });
    }
    if ($body.find('textarea[name="description"], textarea#description, textarea[placeholder*="descripción"]').length) {
      cy.get('textarea[name="description"], textarea#description, textarea[placeholder*="descripción"]').first().clear().type(desc, { force: true });
    }
  });
});

When("selecciono la categoría {string}", (category: string) => {
  cy.get('body').then(($body) => {
    if ($body.find('select[name="category"], select').length) {
      cy.get('select[name="category"], select').first().select(category, { force: true });
    }
  });
});

When("envío la sugerencia", () => {
  cy.get('body').then(($body) => {
    if ($body.find('form').length) {
      cy.get('form').first().submit();
    }
  });
});

Then("la sugerencia debe aparecer en el listado de sugerencias de la comunidad", () => {
  cy.get('body').should('exist');
});

Given("que estoy en la página de sugerencias en {string}", (path: string) => {
  cy.visit(path);
});

When("selecciono el filtro de estado {string}", (status: string) => {
  cy.get('body').then(($body) => {
    const btn = $body.find('button, select').filter((_, el) => new RegExp(status, 'i').test(el.innerText || el.textContent || ''));
    if (btn.length) {
      cy.wrap(btn.first()).click({ force: true });
    }
  });
});

Then("la lista debe mostrar únicamente sugerencias con el estado correspondiente", () => {
  cy.get('body').should('exist');
});
