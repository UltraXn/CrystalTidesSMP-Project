# 🛡️ Calidad de Código y Estándares de Mantenimiento

Este documento detalla los estándares de calidad, configuración de linters y estructura de mantenimiento unificada para el ecosistema CrystalTides.

## 🏗️ Estrategia de Calidad y Linting en Dos Capas

El ecosistema utiliza una **estrategia de linting híbrida en 2 capas** que balancea la velocidad instantánea del bucle de desarrollo con la rigurosidad semántica en CI/CD:

1. **Capa 1: Bucle TDD y Pre-commit Ultrarrápido (`oxlint`)**:
   - Motor Rust nativo (`oxc`) con ejecución en $< 2.5\text{ s}$ sobre más de 500 archivos.
   - Integración nativa con `oxlint-plugin-react-doctor` para detectar anti-patrones de React sin costo de arranque en Node.js.
   - Comando: `pnpm lint:fast`

2. **Capa 2: Auditoría Semántica Profunda (ESLint 9 Flat Config)**:
   - Configuración centralizada y tipada en `packages/eslint-config` (`base.js` y `react.js`).
   - Gobernanza de complejidad cognitiva ($\le 15$), cero strings duplicados, seguridad SAST y accesibilidad WCAG.
   - Delegación final a `oxlint.configs['flat/recommended']` para apagar reglas redundantes de ESLint y mantener el rendimiento.

### Estructura de Paquetes y Plugins Especializados

La configuración modular en `packages/eslint-config` incorpora:

- **`base.js`**:
  - `@eslint/js` y `typescript-eslint`: Tipado estricto y estándares ECMAScript modernos.
  - `eslint-plugin-sonarjs`: Detección de complejidad cognitiva, duplicación de funciones y code smells.
  - `eslint-plugin-security`: Detección de inyecciones y patrones inseguros.
  - `eslint-plugin-import-x`: Resolución eficiente de módulos ESM.
- **`react.js`**:
  - `eslint-plugin-react-hooks` & `eslint-plugin-react-refresh`: Ciclos de vida y HMR confiable.
  - `eslint-plugin-react-doctor`: Reglas de arquitectura React 19 (prevención de fugas en effects, supresión de re-renders innecesarios y flags de componentes gigantes).
  - `eslint-plugin-better-tailwindcss`: Específico para **Tailwind CSS v4** (reemplazo estricto del obsoleto `eslint-plugin-tailwindcss`).
  - `eslint-plugin-regexp`: Prevención de vulnerabilidades ReDoS (catastrophic backtracking) y optimización de expresiones regulares.
  - **Suites de Testing (`**/\*.{test,spec}.{ts,tsx}`, `**/**tests**/**`)\*\*:
    - `eslint-plugin-vitest`: Verificación de aserciones asíncronas, bloqueo de `.only` accidentales y consistencia en tests.
    - `eslint-plugin-testing-library`: Enforce de consultas semánticas y accesibles (`getByRole`) y prevención de falsos positivos en el renderizado.
  - **E2E & Delimitación de Capas**:
    - `eslint-plugin-playwright`: Aserciones asíncronas fiables en flujos de navegación.
    - `eslint-plugin-boundaries`: Arquitectura modular y fronteras de importación entre paquetes y features.

### Comandos de Mantenimiento

Desde la raíz del monorepo:

```bash
# ⚡ Capa 1: Linting ultrarrápido en Rust (<2.5s)
pnpm lint:fast

# 🔍 Capa 2: Linting semántico completo con ESLint 9
pnpm lint:eslint

# 🛠️ DX: Resolución interactiva de warnings y errores por regla
pnpm lint:interactive

# 🩺 Diagnóstico arquitectónico con React Doctor
pnpm doctor
pnpm doctor:score
```

## 🗄️ Calidad y Auditoría de Base de Datos (PostgreSQL & Supabase)

El ecosistema aplica auditoría estática y gobernanza estricta en las capas de base de datos y migraciones SQL para garantizar rendimiento, seguridad y despliegues sin tiempo de inactividad (_zero-downtime_):

### 1. Herramientas y Linters de Base de Datos

- **SQLFluff (`.sqlfluff`)**: Linter estático para archivos SQL en tiempo real. Enforce de palabras reservadas en mayúsculas (`SELECT`, `INSERT`), identificadores en `snake_case`, y prohibición de subconsultas anidadas ineficientes donde un CTE o `JOIN` es más óptimo.
- **Supabase DB Lint (`splinter`)**: Linter nativo de Supabase para auditar políticas RLS, permisos de ejecución y funciones en vivo o localmente:
  ```bash
  npx supabase db lint
  ```
- **Migraciones Seguras (Squawk / Eugene)**: Prevención de _table locks_ bloqueantes (`ACCESS EXCLUSIVE`) en producción:
  ```bash
  npx squawk database/web-server/migrations/*.sql
  ```

### 2. Invariantes y Antipatrones Prohibidos en PostgreSQL

1. **InitPlan Obligatorio en RLS (`auth_rls_initplan`)**:
   - ❌ **Prohibido**: `USING (auth.uid() = user_id)` (fuerza a Postgres a reevaluar la función por cada fila escaneada).
   - ✅ **Obligatorio**: `USING ((SELECT auth.uid()) = user_id)` (evalúa la función una sola vez como un InitPlan).
2. **Endurecimiento de Funciones `SECURITY DEFINER`**:
   - Toda función `SECURITY DEFINER` debe fijar obligatoriamente `SET search_path = public, pg_temp` para evitar secuestro de esquemas.
   - No exponer funciones administrativas a `anon`. Validar identidad del caller con `auth.uid()`.
3. **Claves Foráneas Siempre Indexadas**:
   - Toda columna referenciada en un foreign key debe tener un índice de cobertura para evitar _Sequential Scans_ en borrados y actualizaciones en cascada.
4. **Cero Políticas Permisivas Abiertas en Tablas Privadas**:
   - Prohibido combinar políticas permisivas (`PERMISSIVE`) con `WITH CHECK (auth.role() = 'authenticated')` en tablas con datos privados (ej. tickets o mensajes), ya que un `OR` permisivo anula cualquier restricción de pertenencia.

### 3. Extensiones Recomendadas para el IDE (`.vscode/extensions.json`)

Para habilitar autocompletado, formateo on-save y diagnóstico visual en el IDE:

- **`sqlfluff.sqlfluff`**: Linter y formateador SQL en tiempo real en el editor.
- **`supabase.supabase-vscode`**: Extensión oficial de Supabase para generación de tipos y gestión de esquemas.
- **`cweijan.vscode-database-client2`**: Explorador visual de base de datos integrado en el IDE.

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
    <h2>{t('section.key', 'Texto Fallback')}</h2>;
    ```

## 🎨 UI & Responsividad

- **Diseño Glassmorphism**: Uso de transparencias y bordes sutiles.
- **Mobile First**: Todos los componentes deben ser responsivos.
- **Espaciado**: Ajustado para pantallas de 16" (laptops) y móviles, evitando márgenes excesivos.
