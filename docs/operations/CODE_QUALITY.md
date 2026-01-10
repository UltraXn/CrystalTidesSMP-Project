# 🛡️ Calidad de Código y Estándares de Mantenimiento

Este documento detalla los estándares de calidad, configuración de linters y estructura de mantenimiento unificada para el ecosistema CrystalTides.

## 🏗️ Monorepo & ESLint Unificado

Hemos migrado a una configuración de ESLint centralizada para garantizar la consistencia entre el Cliente (React) y el Servidor (Node.js).

### Estructura de Paquetes

La configuración se encuentra en el workspace `packages/eslint-config`:

- **base.js**: Reglas comunes para TypeScript/JavaScript (usado por [server](../packages/eslint-config/base.js)).
- **react.js**: Reglas específicas para React + Vite + Hooks (usado por [client](../packages/eslint-config/react.js)).

### Comandos de Mantenimiento

Desde la raíz del proyecto (Turborepo):

```bash
# Verificar linting en todos los workspaces
turbo run lint

# Verificar linting solo en cliente o servidor
turbo run lint --filter=client
turbo run lint --filter=server
```

## ✅ Política Zero-Lint (Cero Advertencias)

El objetivo del proyecto es mantener **cero advertencias (0 warnings)** en el build de producción.

- **`no-explicit-any`**: Prohibido el uso de `any`. Se deben definir interfaces estrictas o usar `unknown` si el tipo es verdaderamente desconocido.
- **`exhaustive-deps`**: Los hooks de React (`useEffect`, `useCallback`) deben declarar todas sus dependencias o justificar explícitamente su omisión.
- **Tipado Estricto**:
  - `Contexts`: Deben tener tipos definidos para sus valores provistos.
  - `Component Props`: Interfaces explícitas para todas las props.
  - `API Responses`: Mapeo de respuestas backend a interfaces frontend.

## 🧪 Testing

El proyecto utiliza **Vitest** como framework de pruebas unitarias y de integración, compatible con la sintaxis de Jest pero optimizado para Vite.

- **Comando**: `npm run test`
- **Ubicación**: Los tests deben estar coubicados con sus componentes/módulos (ej: `Componente.test.tsx`) o en `__tests__`.

## 🌍 Internacionalización (i18n)

El proyecto utiliza `i18next` con soporte completo para Español (default) e Inglés.

### Estructura de Archivos

```
client/src/locales/
├── es/
│   └── [global.json](../client/src/locales/es/global.json)  # Fuente de verdad
└── en/
    └── [global.json](../client/src/locales/en/global.json)  # Traducciones espejo
```

### Flujo de Trabajo

1.  **Agregar Clave**: Añadir la nueva cadena en `es/global.json` bajo la sección correspondiente (ej. `profile`, `wiki`).
2.  **Traducir**: Añadir la misma clave en `en/global.json`.
3.  **Implementar**: Usar el hook `t`:
    ```tsx
    const { t } = useTranslation();
    <h2>{t("section.key", "Texto Fallback")}</h2>;
    ```

## 🎨 UI & Responsividad

- **Diseño Glassmorphism**: Uso de transparencias y bordes sutiles.
- **Mobile First**: Todos los componentes deben ser responsivos.
- **Espaciado**: Ajustado para pantallas de 16" (laptops) y móviles, evitando márgenes excesivos.
