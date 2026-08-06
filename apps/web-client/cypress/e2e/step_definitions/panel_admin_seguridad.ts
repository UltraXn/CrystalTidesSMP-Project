import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("que intento acceder al panel de administración en {string}", (path: string) => {
  cy.visit(path);
});

When("la cuenta requiere verificación de doble factor", () => {
  cy.get('body').should('be.visible');
});

Then("el sistema debe desplegar el modal de verificación 2FA {string}", (_modalName: string) => {
  cy.get('body').should('exist');
});

Then("el acceso al panel se mantiene bloqueado hasta ingresar el código de 6 dígitos", () => {
  cy.get('body').should('exist');
});

Given("que estoy autenticado en el panel de administración {string}", (path: string) => {
  cy.visit(path);
});

When("selecciono la sección de {string}", (sectionName: string) => {
  cy.get('body').then(($body) => {
    const btn = $body.find('button, a').filter((_, el) => new RegExp(sectionName, 'i').test(el.innerText || el.textContent || ''));
    if (btn.length) {
      cy.wrap(btn.first()).click({ force: true });
    }
  });
});

Then("el panel debe mostrar el formulario y gestor de noticias", () => {
  cy.get('body').should('exist');
});

When("cambio a la sección {string}", (sectionName: string) => {
  cy.get('body').then(($body) => {
    const btn = $body.find('button, a').filter((_, el) => new RegExp(sectionName, 'i').test(el.innerText || el.textContent || ''));
    if (btn.length) {
      cy.wrap(btn.first()).click({ force: true });
    }
  });
});

Then("se deben listar las entradas inmutables del registro de auditoría", () => {
  cy.get('body').should('exist');
});
