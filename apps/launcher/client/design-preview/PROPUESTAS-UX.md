# Propuestas UX — resto de vistas del launcher

Análisis de las 6 vistas restantes y propuesta de rediseño para cada una,
siguiendo el lenguaje visual de Home v2 (tokens existentes, SVG en vez de
emojis, jerarquía tipográfica, micro-interacciones).

Orden sugerido por impacto: **Login → Mods → Noticias → Perfiles → Ajustes → Logs**.

---

## 1. LoginPage — "Primera impresión"

**Estado actual:** tarjeta centrada de 480px con 4 tabs (Guardadas /
CrystalTides / Invitado / Microsoft). Los 3 métodos compiten con el mismo
peso visual; iconos emoji (👤🌊🎮🗑️).

**Propuesta:**
- **Layout split 50/50**: izquierda panel de marca (logo grande, tagline,
  olas/gradiente animado sutil); derecha el formulario. Aprovecha los 1280px
  en vez de una columna estrecha flotando.
- **Cuentas guardadas estilo "¿Quién juega hoy?"**: grid de avatares con la
  skin (mc-heads) + nombre; clic y entras. Es lo primero que se ve si hay
  cuentas.
- **Jerarquía de métodos**: Microsoft (Premium) como botón primario
  destacado → CrystalTides secundario → "Continuar sin cuenta" como link
  discreto. Hoy los tres parecen igual de importantes.
- **Device code de Microsoft**: mantener el código grande, añadir botón
  "Copiar código" y abrir la URL automáticamente (plugin-opener ya está
  instalado).
- Sin tabs: una sola columna con secciones; menos clics para el caso común.

## 2. ModManagerPage — "La más densa"

**Estado actual:** 870 líneas; tabs Sync/Buscar; filtros (versión, loader,
categoría, orden, fuente) siempre visibles; la API key de CurseForge se pide
en medio del flujo; categorías con emoji.

**Propuesta:**
- Renombrar tabs: **"Del servidor"** (mods oficiales sincronizados) y
  **"Explorar"**.
- **Banner de sincronización persistente** arriba: "12/12 mods al día ✓" o
  progreso "Sincronizando 3/12…". Hoy el estado se pierde entre pestañas.
- Explorar: **barra de búsqueda protagonista** (estilo spotlight) + filtros
  colapsados en una toolbar de chips; resultados en **grid de tarjetas** con
  icono del mod, nº de descargas y badge **"Instalado"**.
- Selector Modrinth/CurseForge como segmented control con logo, no select.
- API key de CurseForge: diálogo dedicado la primera vez (o sección en
  Ajustes), no un input inline permanente.

## 3. NewsPage — "De lista plana a portada"

**Estado actual:** lista vertical de tarjetas idénticas (chip + fecha +
título + texto). `imageUrl` existe en el modelo pero no se usa. Fecha
absoluta DD/MM/YYYY.

**Propuesta:**
- **Noticia destacada**: la más reciente como hero card con imagen de fondo
  y gradiente; el resto en grid de 2–3 columnas (mismo componente de tarjeta
  que Home v2 → consistencia gratis).
- **Filtros por categoría** con chips (la clase `.chip` ya existe).
- Fechas relativas ("Hace 2 días") coherentes con Home.
- Clic en tarjeta → modal de detalle con el contenido completo.
- Botón actualizar: icon-btn SVG con animación de giro mientras carga.

## 4. ProfileManagerPage — "Tarjetas con carácter"

**Estado actual:** grid de tarjetas con emoji, badge ACTIVO, botones
Editar/Clonar/Eliminar + Activar; párrafo explicativo largo arriba.

**Propuesta:**
- **Banner de color por loader** en la cabecera de cada tarjeta
  (vanilla/Fabric/NeoForge con tonos distintos) → se identifica el tipo de
  un vistazo.
- Acciones secundarias (clonar/eliminar) en **menú contextual "⋯"**; la
  tarjeta respira y Editar/Activar quedan como acciones principales.
- Tarjeta activa: check ✓ + glow accent, más claro que el borde actual.
- Párrafo de ayuda → línea única colapsable o tooltip "?" junto al título.
- Empty state atractivo si solo existe el perfil default (CTA "Crea tu
  primer perfil").
- (Fase 2) drag & drop para reordenar.

## 5. SettingsPage — "Agrupar y dar feedback"

**Estado actual:** columna única de tarjetas (RAM, Java, ventana, red) con
checkboxes nativos y títulos con emoji; guardar sin indicación de "cambios
pendientes".

**Propuesta:**
- **Dos columnas de tarjetas** (o nav lateral de secciones: Rendimiento /
  Java / Ventana / Red) para aprovechar el ancho.
- Slider de RAM con **marca de "recomendado"** y aviso si supera el 50% de
  la RAM del sistema (se puede consultar vía Tauri).
- **Toggles estilo switch** en vez de checkboxes nativos.
- Barra de guardado **sticky** abajo: aparece solo cuando hay cambios sin
  guardar ("dirty state") + feedback "Guardado ✓" animado.
- Mover aquí la API key de CurseForge (ver Mods).

## 6. LogsPage — "Herramienta de diagnóstico real"

**Estado actual:** volcado monospace con hora + nivel + categoría; botones
Actualizar/Copiar/Limpiar con emoji; copiar sin feedback; sin filtros ni
búsqueda.

**Propuesta:**
- **Toolbar**: búsqueda de texto en vivo, chips de nivel con contador
  (Error 2 · Warn 5 · Info 31), toggle **auto-scroll**.
- Líneas compactas: hora corta, badge de nivel coloreado, categoría en
  accent.
- Copiar con feedback "¡Copiado!" (mismo patrón que copiar IP) y opción
  **Exportar .txt**.
- Resaltado del término buscado.

---

## Transversal (todas las vistas)

- **Cero emojis en UI**: sustituir por el set SVG del sidebar (misma
  familia, stroke 2). Hoy conviven emojis y SVGs.
- **Icon-btn unificado** para acciones de cabecera (actualizar, copiar…)
  → crear `CrystalIconButton` reutilizable.
- **Empty states** con mensaje + CTA en todas las listas.
- Mantener `CrystalPageHeader` (eyebrow + title) como estándar — ya es
  consistente y funciona.
