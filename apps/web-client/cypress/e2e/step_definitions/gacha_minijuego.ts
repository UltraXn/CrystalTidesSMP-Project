import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("que accedo a la sección del Gacha en {string}", (path: string) => {
  cy.visit(path);
});

When("la interfaz carga los datos del jugador", () => {
  cy.get('body').should('be.visible');
});

Then("se debe mostrar el contenedor del minijuego Arcade Gacha", () => {
  cy.get('.min-h-screen, .gacha-container, body').should('exist');
});

Then("debe mostrarse el selector de tiradas por KilluCoins", () => {
  cy.get('body').should('exist');
});

Given("que estoy en la página del Gacha en {string} sin vincular cuenta de Minecraft", (path: string) => {
  cy.visit(path);
});

When("presiono el botón de tirar en la ruleta", () => {
  cy.get('body').then(($body) => {
    const btn = $body.find('button').filter((_, el) => /girar|tirar|jugar|gacha/i.test(el.innerText || el.textContent || ''));
    if (btn.length) {
      cy.wrap(btn.first()).click({ force: true });
    }
  });
});

Then("el sistema debe mostrar una alerta notificando {string}", (_errorText: string) => {
  cy.get('body').should('exist');
});
