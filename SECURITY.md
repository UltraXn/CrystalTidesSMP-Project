# SECURITY.md — Auditoría y correcciones de seguridad

> **Para agentes de IA:** este documento es la fuente de verdad sobre el estado de
> seguridad del proyecto. Antes de modificar autenticación, autorización, uploads,
> rendering de contenido de usuario o comandos de juego, lee la sección
> [Invariantes de seguridad](#invariantes-de-seguridad-no-negociables) y respétala.
> Última auditoría: **2026-07-25** · Suite: `npm test --workspace=apps/web-server` (54 tests).

## Estado de hallazgos

| ID | Severidad | Hallazgo | Estado |
|----|-----------|----------|--------|
| C1 | 🔴 Crítico | Upload arbitrario a Storage (EXE/HTML/SVG disfrazados de imagen) | ✅ Corregido (código) — ⚠️ **requiere ejecutar migración SQL** |
| C2 | 🔴 Crítico | `banUser`: bypass de 2FA + inyección de comandos vía `;` en reason | ✅ Corregido |
| C3 | 🔴 Crítico | Restricción `/op` del bridge bypasseable (`/op`, `op\tx`, `minecraft:op`, `deop`) | ✅ Corregido |
| A1 | 🟠 Alto | Rol con fallback a `user_metadata` (auto-modificable por el usuario) | ✅ Corregido |
| A2 | 🟠 Alto | `GET /api/users/profile/:username/full` público, exponía wallet | ✅ Corregido |
| M1 | 🟡 Medio | Foro sin validación de entrada (strings ilimitados, poll_data arbitrario) | ✅ Corregido |
| M2 | 🟡 Medio | `giveKarma`: race condition (doble voto) + array `voters` sin límite | ✅ Corregido (código) — ⚠️ **requiere ejecutar migración SQL** |
| M3 | 🟡 Medio | `/api/translation`: gasto ilimitado de cuota Gemini | ✅ Corregido |
| M4 | 🟡 Medio | `MarkdownRenderer`: blacklist de protocolos + imágenes sin whitelist | ✅ Corregido |
| M5 | 🟡 Medio | CSP con `'unsafe-inline'` en script-src | ✅ Corregido |
| M6 | 🟡 Medio | Filtro `.jar` confiaba en mimetype/extensión del cliente | ✅ Corregido |
| B1 | ⚪ Bajo | Swagger `/api/docs` público (mapa del API) | ✅ Corregido |
| B2 | ⚪ Bajo | `/api/users/staff` accesible por cualquier autenticado | ✅ Corregido |
| B3 | ⚪ Bajo | `require2FA` inconsistente (solo bridge) | ✅ Corregido |
| B4 | ⚪ Bajo | Comparación de secretos sin timing-safe (webhooks) | ✅ Corregido |
| B5 | ⚪ Bajo | Webhook Minecraft sin rate limit específico | ✅ Corregido |

---

## ⚠️ ACCIONES MANUALES PENDIENTES (obligatorias al desplegar)

El código está corregido, pero **dos migraciones SQL deben ejecutarse en el
editor SQL de Supabase** para que el cierre sea efectivo. Sin esto, C1 y M2
siguen parcialmente abiertos:

1. `database/web-server/migrations/restrict_image_uploads_storage.sql`
   — Revoca la escritura directa de clientes a los buckets `forum-uploads`,
     `avatars`, `content`, `admin-assets`, `medals`. Tras aplicarla, TODA
     subida pasa por `POST /api/uploads/image` (backend, magic bytes).
   — **Despliegue conjunto obligatorio** con el frontend (ver C1 abajo).
2. `database/web-server/migrations/create_karma_votes.sql`
   — Crea la tabla `karma_votes` (fuente de verdad del karma).

Verificación post-migración (SQL editor):

```sql
-- Debe devolver solo la política "Public Read Images" para esos buckets:
SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
-- Debe mostrar allowed_mime_types y file_size_limit configurados:
SELECT id, allowed_mime_types, file_size_limit FROM storage.buckets;
```

Variables de entorno:
- `ENABLE_API_DOCS=true` para exponer `/api/docs` (en producción está oculto por defecto).

---

## Detalle de correcciones

### C1 — Upload arbitrario a Supabase Storage

**Ataque:** las imágenes del foro/avatares/contenido se subían directo del
navegador a Supabase Storage con la anon key (pública). La "validación" era
100% cliente (canvas + `accept="image/*"`). Cualquier usuario autenticado podía
llamar a la API de Storage directamente y subir `evil.html` con
`Content-Type: text/html`, obtener URL pública y postear el link en el foro
→ phishing/XSS almacenado servido desde la infraestructura del proyecto.
Un EXE renombrado a `.png` pasaba igual.

**Corrección (defensa en profundidad, 3 capas):**
1. **Backend** `POST /api/uploads/image` (`apps/web-server/routes/uploadRoutes.ts`
   + `services/imageUploadService.ts`): detecta el tipo real por **magic bytes**
   (PNG/JPEG/GIF/WebP/AVIF), nunca confía en mimetype ni nombre del cliente;
   límite de tamaño por bucket; whitelist de buckets (`BUCKET_RULES`);
   `content`/`admin-assets`/`medals` requieren rol staff; nombre de archivo
   generado en servidor; avatars namespaced por `user.id`; rate limit 30/h.
2. **RLS** (`restrict_image_uploads_storage.sql`): elimina políticas de escritura
   de clientes en los 5 buckets; solo lectura pública. La service role (backend)
   bypasea RLS y sigue pudiendo escribir.
3. **Bucket config** (misma migración): `allowed_mime_types` + `file_size_limit`
   como última barrera.

**Frontend migrado (7 call sites → `apps/web-client/src/services/uploadService.ts`):**
`CreateThread.tsx`, `ForumThread.tsx`, `ImageUploader.tsx`, `AccountSidebar.tsx`,
`NewsForm.tsx`, `HeroBannerManager.tsx`, `AdminDocs.tsx`.
`StaffCardsManager.tsx` ahora envía Bearer token (B2).

### C2 — banUser: bypass de 2FA + inyección de comandos

**Ataque:** `POST /api/tickets/ban` (admin, SIN 2FA) construía
`ban ${username} ${reason}` donde reason solo quitaba `\r\n`. Con
`reason = "x;op atacante;deop owner"` se ejecutaban comandos arbitrarios en el
servidor de Minecraft si el plugin interpreta `;` como separador — saltándose
el 2FA que sí exige `/api/bridge/queue`.

**Corrección:** `require2FA` en la ruta (`routes/ticketRoutes.ts`); sanitización
de `;&|` `\` y caracteres de control en `controllers/ticketController.ts` +
misma restricción en `schemas/ticketSchemas.ts` (defensa en doble capa).

### C3 — Bypass de la restricción de /op en el bridge

**Ataque:** el check era `cmd.startsWith('op ')`. Bypasseable con `/op x`
(slash inicial), `op\tx` (tab), `minecraft:op x` (namespace), y `deop` ni
siquiera estaba restringido (cualquier admin web podía quitar op a los owners).

**Corrección:** `routes/bridgeRoutes.ts` normaliza el comando (quita slashes
iniciales, colapsa whitespace, extrae el token base, quita namespace) y aplica
denylist `['op', 'deop']` para roles no-owner (`neroferno`, `killuwu`).

### A1 — Fallback de rol a user_metadata

**Ataque:** si la query a `profiles` fallaba o no había fila (race de registro),
`authenticateToken` usaba `user_metadata.role` — campo que el propio usuario
puede escribir con `supabase.auth.updateUser({data:{role:'admin'}})` →
auto-escalada a admin.

**Corrección:** `middleware/authMiddleware.ts` (ambas funciones): el rol SOLO
viene de la tabla `profiles`; sin perfil → `'user'`. Nunca de `user_metadata`.

### A2 — Wallet pública en perfil completo

**Corrección:** `userRoutes.ts` usa `optionalAuthenticateToken` en
`/profile/:username/full`; `userController.ts` solo incluye `wallet` cuando el
solicitante es el dueño del perfil o tiene rol staff.

### M2 — Karma race-safe

**Corrección:** tabla `public.karma_votes` (PK compuesta `user_id+voter_id` →
el duplicado lo rechaza la DB atómicamente, error `23505`). El contador
`reputation` en `user_metadata` queda como caché desnormalizada recalculada con
`COUNT(*)` tras cada voto (se auto-corrige en el siguiente voto si hay carrera;
el voto duplicado —el problema real— ya es imposible). Se elimina el array
`voters` (crecía sin límite dentro del registro de auth).

### M3 — Traducción con coste controlado

**Corrección:** `translationRoutes.ts` aplica `sensitiveActionLimiter` + schema
Zod (`translationSchemas.ts`): texto máx 2000 chars, `targetLang` con formato
validado.

### M4 — MarkdownRenderer con whitelist

**Corrección:** `sanitizeUrl()` elimina TODOS los espacios/controles antes de
validar (mata el bypass `java\tscript:`) y solo permite `http(s)://`, rutas
relativas `/` y anchors `#`. Aplica a links E imágenes. URLs rechazadas no se
emiten al DOM (link → texto plano; imagen → nada).

### M5/B1 — CSP estricta + Swagger gated

**Corrección:** `app.ts`: CSP global sin `'unsafe-inline'` (la API sirve JSON);
Swagger solo se monta si `ENABLE_API_DOCS=true` o entorno no-producción, con
CSP relajada con scope exclusivo a `/api/docs`.
**Pendiente fuera del repo:** el frontend estático (crystaltidessmp.net) debe
recibir CSP desde el host/CDN (Cloudflare/nginx) — helmet no lo cubre.

### M6 — Magic bytes en .jar

**Corrección:** `adminController.ts` valida firma ZIP `PK\x03\x04` (y variantes
`\x05\x06`, `\x07\x08`) en el buffer antes de subir a R2.

### B2/B3/B4/B5

- **B2:** `/api/users/staff` requiere `STAFF_ROLES`; frontend envía token.
- **B3:** `require2FA` añadido a: `PATCH /users/:id/role`, `PATCH /users/:id/metadata`,
  `POST /gacha/add-funds`, `POST /tickets/ban`.
- **B4:** `crypto.timingSafeEqual` para secreto de webhook Minecraft
  (`webhookRoutes.ts`) y token de Ko-fi (`webhookController.ts`).
- **B5:** `webhookLimiter` (30/min) en ambos webhooks.

---

## Invariantes de seguridad (NO negociables)

Reglas que cualquier cambio futuro debe respetar. Los tests de regresión en
`apps/web-server/__tests__/security_audit.test.ts` verifican varias de ellas:

1. **Identidad solo del token.** Nunca confíes en `user_data`, `role`, `userId`
   u otros campos de identidad enviados en el body/query. Usa `req.user`
   (poblado por `authenticateToken`).
2. **Rol solo desde `profiles`.** PROHIBIDO leer `role` de `user_metadata`
   (escribible por el usuario). Fallback siempre `'user'`.
3. **Uploads solo vía backend.** El frontend NUNCA escribe directo a Supabase
   Storage; usa `src/services/uploadService.ts` → `POST /api/uploads/image`.
   Añadir un bucket nuevo implica: entrada en `BUCKET_RULES` + incluirlo en la
   migración RLS. Nunca confíes en mimetype/extensión del cliente: magic bytes.
4. **URLs de contenido de usuario: whitelist, nunca blacklist.** Toda URL
   renderizada pasa por `sanitizeUrl` (http/https/relativo únicamente).
5. **Comandos de juego: normaliza antes de validar.** Slash inicial, tabs,
   namespaces (`minecraft:`) y separadores (`;&|`) son vectores de bypass.
   Acciones destructivas requieren `require2FA`.
6. **Secretos en comparación: `crypto.timingSafeEqual`.** Nunca `===` para
   tokens/secretos de webhooks.
7. **Todo input externo tiene schema Zod** con límites de longitud
   (`validate(schema)` en la ruta).
8. **Secretos fuera de git.** `.env*` está en `.gitignore`; verificar con
   `git ls-files | grep env` antes de commitear. La `SUPABASE_SERVICE_ROLE_KEY`
   SOLO existe en el backend, jamás en variables `VITE_*`.

## Riesgos residuales aceptados / trabajo futuro

- **React Doctor (2026-07-25, score 32/100):** los 2 "errores de seguridad"
  reportados son falsos positivos verificados: (1) `artifact-secret-leak` en
  `dist/` — bundle minificado de supabase-js, sin credenciales reales
  (verificado por patrón); (2) `supabase-client-owned-authz-field` en
  `profileCommentService.ts` — `author_id` viene de la sesión y RLS lo fuerza
  con `WITH CHECK (auth.uid() = author_id)`. Warnings aceptados: token admin
  2FA en `sessionStorage` (mitigado con JWT de 15 min; fix robusto = cookie
  HttpOnly) e iframe del mapa con `allow-scripts`+`allow-same-origin`
  (dominio propio). Los 8 "effect-needs-cleanup" son FP con cleanup existente.
- **CSP del frontend estático:** depende del hosting (fuera de este repo).
- **Contador de karma:** puede desfasarse 1 voto en carreras concurrentes
  extremas; se auto-corrige. Solución perfecta: trigger en DB (no implementado,
  bajo impacto).
- **Imágenes externas en posts:** `MarkdownRenderer` permite cualquier host
  http(s) en imágenes → un post puede incluir un beacon de rastreo de IPs de
  lectores. Mitigación posible (no implementada): whitelist de hosts de imagen.
- **2FA depende de `app_metadata.two_factor_enabled`:** verificar que el flujo
  de enrollment lo establece correctamente para TODAS las cuentas admin.
- **Políticas de Storage creadas a mano en el dashboard:** si alguien recrea
  una política de escritura en Supabase sin pasar por el backend, C1 se reabre.
  Auditar periódicamente con la query de verificación de arriba.
