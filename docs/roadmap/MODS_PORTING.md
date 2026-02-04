# 🛠️ Mod Porting Roadmap (1.21.1)

Este documento registra los mods que deben ser porteados o actualizados para la versión 1.21.1 del SMP, incluyendo notas técnicas del análisis forense.

## 🏗️ En Progreso

- [ ] **Dungeon Now Loading** (en `source_temp/DungeonNowLoading`)
  - **Origen**: 1.20 (Forge)
  - **Destino**: 1.21.1 (NeoForge)
  - **Estado**: Porting manual requerido.

## 📌 Pendientes (Roadmap Forense)

- [ ] **Whaleborne** (Pedido por usuario)
  - **Source**: [CurseForge](https://www.curseforge.com/minecraft/mc-mods/whaleborne)
  - **Prioridad**: Media.
- [ ] **Collector's Reap**
  - **Source**: [GitHub](https://github.com/brnbrd/CollectorsReap)
  - **Prioridad**: Media (Farmer's Delight Addon).
- [ ] **BetterBeacons**
  - **Notas**: Requiere Porting/Fix Mixin para 1.21.1.
- [ ] **Immersive Portals**
  - **Estado**: Recuperación/Debug tras crash previo detectado en informes forenses.
- [ ] **ModernFix**
  - **Tipo**: Optimización Crítica.
  - **Acción**: Instalar para reducir consumo de RAM y tiempos de arranque.

## ⚠️ Análisis de Riesgos (Anatomía del Servidor)

- **Hybrid Hell**: El servidor usa `youer` (MohistMC), lo que rompe plugins que tocan NMS (FAWE, Citizens).
- **Bloatware**: El núcleo Youer incluye un cliente de DeepSeek AI ("Xiaoxiaomo") hardcodeado. Considerar migrar a un núcleo más limpio si hay problemas de estabilidad.
- **Conflictos de Red**:
  - [x] Conflicto Plan/Oraxen (Puerto 19610) -> **RESUELTO** (Plan movido a 8804).
  - [x] Oraxen Local -> **RESUELTO** (Migrado a Polymath).

## 🚀 Optimizaciones de Infraestructura

- **Chunky Offline**: Reemplazar plugin Chunky por esta alternativa para evitar crashes por carga excesiva de Chunks durante la pre-generación.

---

_Última actualización: 17 de Enero, 2026_
