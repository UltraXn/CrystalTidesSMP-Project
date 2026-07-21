# Registro del rediseño UX/UI — CrystalTides Launcher

Fecha: 2026-07-19
Rama de trabajo: working tree (sin commit)

---

## 1. Archivos MODIFICADOS (con backup)

| Archivo | Cambio | Backup |
|---|---|---|
| `src/components/HomePage.tsx` | Rediseño v2 completo | `design-preview/backups/HomePage.tsx.bak` |
| `src/components/MainLayout.tsx` | Sidebar con mini-etiquetas + prop `onNavigate` | `design-preview/backups/MainLayout.tsx.bak` |
| `src/components/ProfileSelector.tsx` | Trigger restilizado (chip v2 con meta + RAM) | `design-preview/backups/ProfileSelector.tsx.bak` |
| `src/index.css` | Bloque ADITIVO al final (ping, float, news-card-v2, copied-tip) | `design-preview/backups/index.css.bak` |

## 2. Archivos NUEVOS (borrar para eliminar)

- `design-preview/home-v2.html` — maqueta interactiva de referencia
- `design-preview/REDESIGN.md` — este registro
- `design-preview/PROPUESTAS-UX.md` — propuestas para el resto de vistas
- `design-preview/backups/*` — copias de seguridad

## 3. Cómo revertir

### Revertir TODO el rediseño (volver al estado original)

```powershell
cd apps\launcher-tauri
Copy-Item design-preview\backups\HomePage.tsx.bak src\components\HomePage.tsx
Copy-Item design-preview\backups\MainLayout.tsx.bak src\components\MainLayout.tsx
Copy-Item design-preview\backups\ProfileSelector.tsx.bak src\components\ProfileSelector.tsx
Copy-Item design-preview\backups\index.css.bak src\index.css
Remove-Item -Recurse -Force design-preview
```

### Revertir solo UN archivo

Copia el `.bak` correspondiente sobre el archivo modificado (misma mecánica que arriba).

## 4. Qué se implementó (Home v2)

- **Hero**: saludo según hora del día + username grande + badge de tipo de cuenta.
- **Módulo de servidor consolidado**: dot pulsante, IP, jugadores online, botón copiar IP con feedback "¡IP copiada!" (antes el estado aparecía duplicado en pill + tarjeta).
- **Novedades**: 3 tarjetas con chip de categoría coloreado, thumb con gradiente o imagen real de Supabase, fecha relativa. Datos reales vía `fetchNews(3)`. "Ver todo" navega a la vista Noticias.
- **Tarjeta de jugador**: username + chip de rango (si `role`/`linkedCrystalRole` ≠ user) + SkinViewer con pedestal de luz y animación de flotación.
- **Dock**: selector de perfil como chip (icono + nombre + versión · loader · RAM) y botón JUGAR con **progreso integrado** (relleno, % y estado dentro del propio botón). Estado "En juego" en verde al completar.
- **Sidebar**: mini-etiquetas de 9.5px bajo cada icono, indicador activo lateral.
- Fix menor: tras editar/clonar/eliminar un perfil, el selector se remonta (key) y muestra datos frescos.

## 5. Verificación

- `npm run build` (tsc + vite build) ✓ — 2026-07-19
- Pendiente: prueba visual con `npm run tauri dev`.
