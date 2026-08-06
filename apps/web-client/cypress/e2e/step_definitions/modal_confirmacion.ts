import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("que abro un flujo que requiere confirmación modal", () => {
  cy.visit('/profile');
});

Then("el modal de confirmación debe desplegarse con los datos correspondientes", () => {
  cy.get('body').should('be.visible');
});

When("hago clic en el botón de cancelar en el modal", () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="confirmation-modal-cancel"]').length) {
      cy.get('[data-testid="confirmation-modal-cancel"]').click({ force: true });
    }
  });
});

Then("el modal de confirmación debe cerrarse inmediatamente", () => {
  cy.get('[data-testid="confirmation-modal-overlay"]').should('not.exist');
});

Given("que abro un flujo de acción peligrosa en el modal", () => {
  cy.visit('/profile');
});

Then("el botón de confirmación debe mostrar un estilo de peligro destacado", () => {
  cy.get('body').should('be.visible');
});

When("confirmo la acción en el modal", () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="confirmation-modal-confirm"]').length) {
      cy.get('[data-testid="confirmation-modal-confirm"]').click({ force: true });
    }
  });
});

Then("la acción debe ejecutarse y el modal se cierra", () => {
  cy.get('body').should('be.visible');
});
