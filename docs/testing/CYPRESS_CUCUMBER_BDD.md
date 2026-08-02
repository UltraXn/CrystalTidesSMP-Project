# 🥒 Guía de Pruebas Automatizadas BDD (Cypress + Cucumber)

Esta guía documenta la infraestructura de pruebas **End-to-End (E2E) y BDD (Behavior Driven Development)** configurada para CrystalTides SMP.

---

## 🚀 Comandos Rápidos

```bash
# Abrir la interfaz gráfica interactiva de Cypress
npm --prefix apps/web-client run cy:open

# Ejecutar todas las pruebas BDD en segundo plano (headless)
npm --prefix apps/web-client run test:e2e
```

---

## 📁 Estructura del Proyecto de Pruebas

```
apps/web-client/
├── cypress.config.ts                   # Configuración del compilador Esbuild + Cypress
├── .cypress-cucumber-preprocessorrc.json # Definición del path de steps
└── cypress/
    └── e2e/
        ├── features/                   # Archivos .feature redactados en español (Gherkin)
        │   └── wiki_bestiario.feature
        └── step_definitions/           # Mapeos de frases en lenguaje humano a Cypress TS
            └── wiki_bestiario.ts
```

---

## 📄 Cómo Escribir una Nueva Prueba BDD

1. Crea un nuevo archivo `.feature` en `cypress/e2e/features/` (ej. `gacha.feature`):

```gherkin
# language: es
Característica: Sistema de Gacha y Tiradas

  Escenario: Usuario realiza una tirada en la ruleta Arcade
    Dado que el usuario navega a "/gacha"
    Cuando hace clic en "Girar Ruleta"
    Entonces se debe mostrar la animación 3D de la máquina
    Y se otorga una recompensa al usuario
```

2. Crea las definiciones de paso en TypeScript en `cypress/e2e/step_definitions/gacha.ts`:

```typescript
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("que el usuario navega a {string}", (url: string) => {
  cy.visit(url);
});

When("hace clic en {string}", (btnText: string) => {
  cy.contains(btnText).click();
});
```
