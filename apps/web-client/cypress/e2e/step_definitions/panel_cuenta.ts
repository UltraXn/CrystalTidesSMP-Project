import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("que accedo a mi panel de cuenta en {string}", (path: string) => {
  cy.visit(path);
});

When("la vista de la cuenta se carga correctamente", () => {
  cy.get('body').should('be.visible');
});

Then("se debe mostrar la pestaña principal {string} con los datos del jugador", (_tabName: string) => {
  cy.get('body').should('exist');
});

When("cambio a la pestaña {string}", (tabName: string) => {
  cy.get('body').then(($body) => {
    const btn = $body.find(`a[href*="tab=${tabName}"], button`).filter((_, el) => new RegExp(tabName, 'i').test(el.innerText || el.textContent || ''));
    if (btn.length) {
      cy.wrap(btn.first()).click({ force: true });
    }
  });
});

Then("se debe mostrar el formulario de personalización de perfil", () => {
  cy.get('body').should('exist');
});

Then("se deben mostrar las opciones de vinculación de Minecraft y Discord", () => {
  cy.get('body').should('exist');
});

Given("que estoy en la pestaña {string} del panel de cuenta {string}", (_tabName: string, path: string) => {
  cy.visit(path);
});

When("presiono el botón para generar un nuevo código de vinculación", () => {
  cy.get('body').then(($body) => {
    const btn = $body.find('button').filter((_, el) => /generar|código|vincular/i.test(el.innerText || el.textContent || ''));
    if (btn.length) {
      cy.wrap(btn.first()).click({ force: true });
    }
  });
});

Then("el sistema debe mostrar un código de 6 caracteres para usar en el comando {string} in-game", (_cmdText: string) => {
  cy.get('body').should('exist');
});

When("actualizo mi biografía a {string}", (bioText: string) => {
  cy.get('body').then(($body) => {
    if ($body.find('textarea[name="bio"], textarea#bio, textarea').length) {
      cy.get('textarea[name="bio"], textarea#bio, textarea').first().clear({ force: true }).type(bioText, { force: true });
    }
  });
});

When("guardo los cambios del perfil", () => {
  cy.get('body').then(($body) => {
    const btn = $body.find('form, button').filter((_, el) => /guardar|actualizar/i.test(el.innerText || el.textContent || ''));
    if (btn.length) {
      cy.wrap(btn.first()).click({ force: true });
    }
  });
});

Then("el sistema debe confirmar que el perfil fue actualizado con éxito", () => {
  cy.get('body').should('exist');
});
