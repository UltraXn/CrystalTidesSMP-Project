# Task 10 Brief: Calibración de Contraste en Web Client (305 Issues css:S7924)

## Objetivo

Resolver las incidencias `css:S7924` en `apps/web-client` donde SonarQube reporta contraste insuficiente de texto sobre fondo oscuro (relación inferior a 4.5:1 para texto normal WCAG AA).

## Archivos a Modificar

- `apps/web-client/src/index.css`
- `apps/web-client/tailwind.config.js`
- Clases comunes de texto secundario en componentes (ej. `text-zinc-500` -> `text-zinc-400`, `text-neutral-500` -> `text-neutral-400`, `text-slate-500` -> `text-slate-400`, `text-muted-foreground`).

## Requisitos

- En fondo oscuro (`#09090b` / `zinc-950` / `zinc-900`), `zinc-500` (#71717a) tiene ratio ~3.6:1 (falla WCAG AA). `zinc-400` (#a1a1aa) tiene ratio ~6.5:1 (cumple con holgura WCAG AA >= 4.5:1).
- Actualizar tokens en `index.css` / `tailwind.config.js` y clases en los componentes para elevar el contraste de los textos tenues manteniendo la estética premium y oscura de CrystalTides.

## Verificación

Ejecutar:
`cmd /c "npm run build"` o `npx tsc --noEmit` en `apps/web-client`
Verificar que la build pase sin errores de sintaxis ni de tipos.

## Reporte

Escribir el reporte en:
`.superpowers/sdd/2026-10-11-monorepo-quality-remediation/task-10-report.md`
