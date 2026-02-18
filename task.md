# 📋 Tareas Actuales - CrystalTides SMP

## 🛠️ En Progreso

- [x] **Hotfix Layout Mantenimiento**: Logo y layout en `Maintenance.tsx` [ID: FIX-001] ✅
- [x] **Depuración CI/CD & Consola**: Resolver fallos en GitHub Actions, limpiar CSP/Permissions-Policy y errores de GSAP/Three.js [ID: CI-001] ✅

## 📌 Deuda Técnica / Pendiente


## ✅ Completado

- [x] **Sincronización de Ramas**: Merge de `dev` a `main` completado [ID: SYNC-001]
  - [x] Pull de `dev`
  - [x] Cambio a `main` e intento de merge
  - [x] Resolución de conflictos (7 archivos resueltos adoptando estándares de `dev`)
    - [x] `.gitignore`
    - [x] `GamificationManager.tsx`
    - [x] `PollFormModal.tsx`
    - [x] `StaffList.tsx`
    - [x] `CreateTicketModal.tsx`
    - [x] `TicketDetailModal.tsx`
    - [x] `PremiumConfirm.tsx`
  - [x] Push a `main`
- [x] **CI Quality Check**: Verificación exitosa de Lint y Build en Client, Server y Shared
- [x] Stash de cambios locales en `fix/maintenance-page-layout`
- [x] Verificar consistencia de `task.md` vs `docs/roadmap/TODO.md`
- [x] **Restauración de Tests Unitarios**: Reemplazar `smoke.test.ts` con tests reales migrados de las versiones anteriores.
- [ ] Address React Doctor Findings
    - [ ] Migrate remaining `fetch()` in `useEffect` to TanStack Query (13 instances)
    - [ ] Refactor `AdminDocs.tsx` (Reduce size, optimize state with `useReducer`)
    - [ ] Fix missing `alt` attributes on images
    - [ ] Replace `motion` with `m` + `LazyMotion` for bundle optimization (27 instances)
    - [ ] Fix array index keys `key={index}` (26 instances)
    - [ ] Optimize `transition: "all"` to specific properties (40 instances)
    - [ ] Add `prefers-reduced-motion` handling
    - [ ] Implement `useReducer` for components with excessive `useState`
- [ ] Implement robust error handling in `apiService.ts` (retries, toast notifications)
- [ ] Verify fixes with tests and manual checks
- [ ] Audit React patterns (hooks, data fetching, performance) <!-- id: 3 -->
- [ ] Check Tailwind CSS 4 implementation <!-- id: 4 -->
- [ ] Verify changes and document in walkthrough <!-- id: 7 -->
