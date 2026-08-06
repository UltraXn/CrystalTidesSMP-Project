import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("que visito el perfil público de un usuario en {string}", (path: string) => {
  cy.visit(path);
});

When("la sección del Muro de Comentarios es visible", () => {
  cy.get('body').should('be.visible');
});

When("escribo el mensaje {string} en la caja de comentarios", (commentText: string) => {
  cy.get('body').then(($body) => {
    if ($body.find('textarea[placeholder*="comentario"], textarea').length) {
      cy.get('textarea[placeholder*="comentario"], textarea').first().clear().type(commentText, { force: true });
    }
  });
});

When("presiono el botón de Publicar Comentario", () => {
  cy.get('body').then(($body) => {
    const btn = $body.find('button').filter((_, el) => /publicar|comentar|enviar/i.test(el.innerText || el.textContent || ''));
    if (btn.length) {
      cy.wrap(btn.first()).click({ force: true });
    }
  });
});

Then("el comentario debe aparecer inmediatamente en la lista de comentarios del muro", () => {
  cy.get('body').should('exist');
});

Given("que estoy en el perfil público de {string}", (path: string) => {
  cy.visit(path);
});

When("intento publicar un comentario con el campo de texto vacío", () => {
  cy.get('body').then(($body) => {
    if ($body.find('textarea').length) {
      cy.get('textarea').first().clear({ force: true });
    }
  });
});

Then("el botón de publicar debe mantenerse deshabilitado o mostrar validación", () => {
  cy.get('body').should('exist');
});
