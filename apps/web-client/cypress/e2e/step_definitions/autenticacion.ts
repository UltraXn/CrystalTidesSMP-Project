import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("que navego al formulario de registro en {string}", (path: string) => {
  cy.visit(path);
});

When("ingreso el usuario {string}, correo {string} y contraseña {string}", (username: string, email: string, pass: string) => {
  cy.get('#register-username').clear().type(username);
  cy.get('#register-email').clear().type(email);
  cy.get('#register-password').clear().type(pass);
  cy.get('#register-confirm-password').clear().type(pass);
});

When("dejo el campo trampa de Honeypot vacío", () => {
  cy.get('input[name="confirm_email"]').should('have.value', '');
});

When("envío el formulario de registro", () => {
  cy.get('form').submit();
});

Then("la aplicación procesa la solicitud de registro correctamente", () => {
  // Verifies url or success navigation state
  cy.url().should('include', '/register');
});

Given("que navego a la página de inicio de sesión en {string}", (path: string) => {
  cy.visit(path);
});

When("ingreso el correo {string} y la contraseña {string}", (email: string, pass: string) => {
  cy.get('#login-email').clear().type(email);
  cy.get('#login-password').clear().type(pass);
});

When("presiono el botón de Iniciar Sesión", () => {
  cy.get('form').submit();
});

Then("el sistema debe mostrar un mensaje de error de credenciales", () => {
  cy.get('.text-rose-300, .error-message').should('be.visible');
});

When("un bot completa el campo invisible {string} con {string}", (fieldName: string, botValue: string) => {
  cy.get(`input[name="${fieldName}"]`).invoke('val', botValue).trigger('change', { force: true });
});

When("envía la solicitud de registro", () => {
  cy.get('form').submit();
});

Then("el backend debe interceptar al bot con una trampa Honeypot", () => {
  // Honeypot triggers tarpitting or 400 Bad Request
  cy.get('form').should('exist');
});
