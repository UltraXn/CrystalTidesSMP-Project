# Plan Maestro de Remediación de Calidad — Monorepo CrystalTides (944 Issues)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Erradicar de manera sistemática, verificable y sin regresiones las 944 incidencias activas reportadas por SonarQube en los 8 proyectos del monorepo, priorizando bugs y vulnerabilidades reales antes de la deuda estilística.

**Architecture:** Estrategia concéntrica en 4 oleadas (Waves) de ataque:

1. Fiabilidad & Seguridad (Bugs + Vulns);
2. Complejidad Cognitiva ($\le 15$) & Refactor a Feature Hooks;
3. Higiene de Tipos y TypeScript Moderno (Anti-nesting, Optional Chaining, Readonly Props);
4. Contraste y Tokens de Diseño en Web Client (WCAG AA).

**Tech Stack:** TypeScript 5.x, React 19/18, Vite/SWC, Tauri v2 (Rust 1.80+), Java 21 (Paper / Fabric), Oxlint, SonarQube API.

**Spec:** SonarQube Community Edition 10.x Ruleset (`squ_b7ab8a5e28e272a2c0b70d3d9051a0e85a5cd253`).

---

## 🎯 Global Constraints

- **Compilador y Herramientas React**: Obligatorio `@vitejs/plugin-react-swc`, Oxlint, y mantener complejidad cognitiva $\le 15$ (`sonarjs/cognitive-complexity` / `S3776`).
- **Gobernanza de Memoria**: Límite estricto de JVM para scanners y builds (`-Xmx512m` en `SONAR_SCANNER_OPTS`) para prevenir OOM por commit charge en Windows.
- **Strict TDD & Cero Regresiones**: Todo bug o vulnerabilidad corregida debe contar con verificación de compilación limpia (`tsc --noEmit`, `cargo check`, `./gradlew build` o `mvn compile`) antes del siguiente paso.
- **Higiene de Secretos**: Ningún token, API key ni webhook puede quedar en texto plano ni en archivos `.properties`.

---

## 🔍 Review Focus (Casos de Borde Críticos)

1. **Persistencia SQL en CrystalCore**: Asegurar que las correcciones de consultas JDBC manejen adecuadamente `SQLException` y conexiones en pools HikariCP sin fugas de cursores.
2. **IPC y Concurrencia en GameBridge**: Preservar el tope de 16KB por frame y el handshake de autenticación local.
3. **Manejo de CurseForge / Modrinth en Launcher**: Evitar llamadas con API keys nulas y asegurar fallbacks limpios en modo offline.
4. **State Management en Launchers**: Evitar triggers de re-render masivos al desacoplar hooks complejos.
5. **Contraste de Accesibilidad en Web Client**: Preservar la identidad visual del tema oscuro de CrystalTides al subir ratios a $\ge 4.5:1$ (WCAG AA).

---

## 🌊 OLEADA 1: Fiabilidad & Seguridad (64 Bugs + 13 Vulnerabilidades)

### Task 1: Remediación de Bugs SQL / JDBC en CrystalCore (6 Bugs)

**Files:**

- Modify: `plugins/crystalcore/src/main/java/com/crystaltides/core/database/*.java`
- Modify: `plugins/crystalcore/src/main/java/com/crystaltides/core/modules/*.java`

**Interfaces:**

- Consumes: PaperMC 1.20.4 API, HikariCP DataSource.
- Produces: Queries parametrizadas seguras y ResultSet cerrados en try-with-resources.

- [ ] **Step 1: Consultar los 6 bugs exactos de SonarQube**
      Ejecutar: `powershell -File scratch/get_project_issues.ps1 crystaltides-crystalcore BUG`
- [ ] **Step 2: Aplicar correcciones quirúrgicas en bloques try-with-resources y comparaciones de literales**
- [ ] **Step 3: Compilar y verificar con Maven**
      Ejecutar: `cmd /c "mvn -f plugins/crystalcore/pom.xml compile -DskipTests"`
      Expected: BUILD SUCCESS
- [ ] **Step 4: Re-escanear en SonarQube y verificar 0 bugs**

---

### Task 2: Remediación de Bugs en GameBridge (3 Bugs)

**Files:**

- Modify: `apps/game-bridge/java-agent/src/main/java/com/crystaltides/agent/**/*.java`
- Modify: `apps/game-bridge/native-core/src/**/*.rs`

- [ ] **Step 1: Consultar los 3 bugs exactos de SonarQube en gamebridge**
- [ ] **Step 2: Corregir serialización y manejo de recursos en java-agent**
- [ ] **Step 3: Compilar java-agent y validar native-core con cargo clippy**
      Ejecutar: `powershell -File apps/game-bridge/java-agent/build-agent.ps1`
      Ejecutar: `cargo clippy --manifest-path apps/game-bridge/native-core/Cargo.toml`
      Expected: Exit Code 0 en ambos.
- [ ] **Step 4: Re-escanear y verificar 0 bugs en crystaltides-gamebridge**

---

### Task 3: Remediación de Vulnerabilidades y Criticals en Discord Bot (1 Vuln + 5 Criticals)

**Files:**

- Modify: `apps/discord-bot/src/**/*.ts`

- [ ] **Step 1: Consultar la vulnerabilidad y los 5 criticals restantes**
- [ ] **Step 2: Corregir inyecciones o desreferencias inseguras en servicios**
- [ ] **Step 3: Validar TypeScript**
      Ejecutar: `cmd /c "npx tsc --noEmit"` en `apps/discord-bot`
      Expected: 0 errores.
- [ ] **Step 4: Re-escanear y verificar 0 bugs y 0 vulns en discord-bot**

---

### Task 4: Remediación de Seguridad y Bugs en Launcher Suite (28 Bugs + 10 Vulns)

**Files:**

- Modify: `apps/launcher/client/src/services/*.ts`
- Modify: `apps/launcher/client/src/components/**/*.tsx`
- Modify: `apps/launcher/installer/src/**/*.ts`
- Modify: `apps/launcher/uninstaller/src/**/*.ts`

- [ ] **Step 1: Extraer listado completo de los 28 bugs y 10 vulnerabilidades**
- [ ] **Step 2: Corregir regex vulnerables (ReDoS `javascript:S5852`), validaciones `undefined` y listeners sin cleanup**
- [ ] **Step 3: Validar tipos y build cliente**
      Ejecutar: `cmd /c "npx tsc --noEmit"` en `apps/launcher/client`
      Expected: Exit Code 0.
- [ ] **Step 4: Re-escanear y confirmar reducción a 0 Bugs y 0 Vulns en SonarQube**

---

### Task 5: Remediación de Seguridad y Bugs en Launcher Lite (27 Bugs + 2 Vulns)

**Files:**

- Modify: `apps/launcher-lite/src/services/*.ts`
- Modify: `apps/launcher-lite/src/components/**/*.tsx`
- Modify: `apps/launcher-lite/src-tauri/src/**/*.rs`

- [ ] **Step 1: Extraer listado de los 27 bugs y 2 vulns en launcher-lite**
- [ ] **Step 2: Corregir dependencias faltantes en useEffects, eventos de ciclo de vida y casting inseguro**
- [ ] **Step 3: Validar con Oxlint y Cargo Clippy**
      Ejecutar: `cmd /c "npx oxlint src"` y `cargo clippy --manifest-path src-tauri/Cargo.toml`
      Expected: 0 warnings, 0 errores.
- [ ] **Step 4: Re-escanear y validar 0 Bugs y 0 Vulns en crystaltides-launcher-lite**

---

## 🌊 OLEADA 2: Arquitectura & Complejidad Cognitiva ($\le 15$)

### Task 6: Desacoplamiento de Monolitos con `sonarjs/cognitive-complexity` (46 Incidencias S3776)

**Files:**

- Modify: `apps/launcher-lite/src/components/modals/*.tsx`
- Modify: `apps/launcher-lite/src/components/HomeDock.tsx`
- Modify: `apps/launcher/client/src/components/**/*.tsx`
- Modify: `apps/game-bridge/native-core/src/**/*.rs`

- [ ] **Step 1: Mapear los métodos y componentes con complejidad cognitiva $> 15$**
- [ ] **Step 2: Extraer sub-funciones puras en `utils/` y Feature Hooks dedicados (`use[Feature]`) según protocolo AGENTS.md**
- [ ] **Step 3: Sustituir estructuras `if/else` anidadas por Lookup Maps y Early Returns**
- [ ] **Step 4: Verificar compilación y verificar caída a 0 de `typescript:S3776`**

---

## 🌊 OLEADA 3: Higiene de Tipos y TypeScript Moderno (300+ Smells)

### Task 7: Desanidado de Operadores Ternarios (`typescript:S3358` - 84 Incidencias)

**Files:**

- Modify: Componentes React en `launcher-lite`, `launcher` y `web-client`.

- [ ] **Step 1: Identificar ternarios anidados `a ? b : c ? d : e`**
- [ ] **Step 2: Refactorizar a funciones auxiliares de renderizado (`renderStatusBadge()`) o sentencias `switch`/`if` legibles**
- [ ] **Step 3: Validar que la UI renderice idénticamente sin cambios visuales**

---

### Task 8: Adopción Masiva de Optional Chaining (`typescript:S6582` - 71 Incidencias)

**Files:**

- Modify: `apps/**/*.ts`, `apps/**/*.tsx`

- [ ] **Step 1: Reemplazar patrones `a && a.b && a.b.c` por `a?.b?.c`**
- [ ] **Step 2: Ejecutar typecheck global con turbo o tsc**

---

### Task 9: Inmutabilidad de React Props (`typescript:S6759` - 69 Incidencias)

**Files:**

- Modify: Interfaces de componentes `interface Props { readonly ... }` o `Readonly<Props>`

- [ ] **Step 1: Asegurar tipado `readonly` en interfaces de props para prevenir mutaciones accidentales**
- [ ] **Step 2: Validar compilación en todos los frontends**

---

## 🌊 OLEADA 4: Accesibilidad & Tokens de Contraste en Web Client (305 Incidencias `css:S7924`)

### Task 10: Auditoría y Calibración de Contraste WCAG AA (`css:S7924` - 305 Incidencias)

**Files:**

- Modify: `apps/web-client/tailwind.config.js`
- Modify: `apps/web-client/src/index.css`
- Modify: `apps/web-client/src/components/**/*.tsx`

- [ ] **Step 1: Extraer clases de color de texto/fondo con ratio $< 4.5:1$ detectadas por SonarQube**
- [ ] **Step 2: Ajustar tonos de grises secundarios (ej. `text-zinc-500` $\rightarrow$ `text-zinc-400` sobre fondos oscuros `#09090b`) manteniendo la estética premium y garantizando ratio $\ge 4.5:1$**
- [ ] **Step 3: Re-escanear `crystaltides-web-client` en SonarQube y verificar liquidación de las 305 incidencias**

---

## 🏁 Verificación Final Global

- [ ] **Ejecutar escaneo completo de los 8 proyectos en SonarQube con `-Xmx512m`**
- [ ] **Verificar Quality Gate verde en los 8 proyectos**
- [ ] **Consolidar informe final con 0 Bugs, 0 Vulnerabilidades y Quality Gates aprobados**
