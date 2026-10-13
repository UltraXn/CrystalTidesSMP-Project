# Task 3 Brief: Remediación de Seguridad y Complejidad en Discord Bot

## Objetivo

1. `[typescript:S5332]` en `apps/discord-bot/src/services/pelicanService.ts:L12`: El protocolo `http://` está hardcodeado. Cambiar a `https://` o permitir que se configure dinámicamente mediante `process.env.PELICAN_URL || 'https://...'`.
2. `[typescript:S3776]` en `apps/discord-bot/src/services/cardCanvasService.ts:L45`: Reducir la complejidad cognitiva (actualmente 21, límite 15) extrayendo funciones puras de dibujo (`drawCardBackground`, `drawAvatarBadge`, `drawTextMetrics`).
3. `[typescript:S3776]` en `apps/discord-bot/src/services/powerManager.ts`: Reducir la complejidad cognitiva descomponiendo handlers en sub-funciones puras.

## Archivos a Modificar

- `apps/discord-bot/src/services/pelicanService.ts`
- `apps/discord-bot/src/services/cardCanvasService.ts`
- `apps/discord-bot/src/services/powerManager.ts`

## Verificación

Ejecutar typecheck en `apps/discord-bot`:
`cmd /c "npx tsc --noEmit"`
Verificar que compile con 0 errores (código 0).

## Reporte

Escribir el reporte en:
`.superpowers/sdd/2026-10-11-monorepo-quality-remediation/task-3-report.md`
