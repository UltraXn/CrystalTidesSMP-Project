# CrystalBot v2.0 - Hoja de Ruta (ToDo)

## 🔄 Integración y Sincronización

- [ ] **Sincronización Bidireccional de Chat (Chat Bridge)**
  - [ ] **Discord -> Minecraft**: Permitir enviar mensajes desde un canal de staff en Discord al juego.
  - [ ] **Minecraft -> Discord**: Replicar el chat público del juego en un canal `#chat-global` (solo lectura o interactivo).

- [x] **Sistema de Verificación (Link)**
  - [x] Crear comando `/link` en Minecraft para generar código (Backend/Web).
  - [x] Crear comando slash `/link <code>` en Discord.
  - [ ] Sincronizar automáticamente roles (VIP, MVP, Staff) al verificar.

## 🛠️ Herramientas de Administración y Moderación

- [ ] **Sistema de Tickets Integrado**
  - [ ] Notificar en `#tickets-staff` cuando se crea/responde un ticket en la web.
  - [ ] Comandos rápidos para cerrar/gestionar tickets desde Discord (`/ticket close <id>`).

- [ ] **Moderación Cruzada Automatizada**
  - [ ] Asignar rol "Sancionado" en Discord si el usuario es baneado en el juego.
  - [ ] Alerta de evasión de ban (misma IP/Discord ID).

## 📊 Información y Estadísticas

- [ ] **Comando de Estadísticas `/stats <jugador>`**
  - [ ] **Sincronización Web**: Mostrar las mismas métricas que el Dashboard (`Account.tsx`).
  - [ ] **Playstyle Radar**: Incluir los 5 atributos oficiales sincronizados con la Web (`PlaystyleRadarFinal.tsx`):
    - [ ] 🛠️ **Constructor**: Bloques Minados + Colocados (`blocksMined + blocksPlaced`).
    - [ ] ⚔️ **Luchador**: Puntos de Combate (`15 * PvP Kills + 1 * Mob Kills`).
    - [ ] 💰 **Mercader**: Escala Logarítmica (`100 * log10(KilluCoins)`).
    - [ ] 💖 **Constancia**: Exponencial `(Días de Racha)²`.
    - [ ] 🗺️ **Explorador**: `(Horas Jugadas * 10) + Km Recorridos`.
  - [ ] Generar imagen/embed visual similar al diseño "Glassmorphism" de la web.

- [ ] **Canal de Estado en Vivo (Live Status)**
  - [ ] Mensaje auto-actualizable (cada 60s) en canal `#estado`.
  - [ ] Mostrar: Estado (Online/Offline), TPS, RAM usada, Lista de jugadores online.

- [ ] **Notificaciones de Eventos**
  - [ ] Anuncios automáticos en `#eventos` cuando inicie un evento en el juego (KOTH, Spleef, Torneo).

## ⚙️ Mejoras Técnicas

- [ ] **Migrar Loggers restantes**: Asegurar que todos los módulos usen el nuevo servicio de `Logger` con colores.
- [ ] **Panel de Control de Bot**: Comandos para reiniciar subsistemas del bot sin apagar el proceso (`/bot reload`).
