import { WikiArticle } from '../services/wikiService'
import generatedBestiary from './generatedBestiary.json'

export const FALLBACK_ARTICLES: WikiArticle[] = [
    ...(generatedBestiary as unknown as WikiArticle[]),
    // 📚 Guías del Servidor
    {
        id: 101,
        slug: 'comandos-basicos',
        title: 'Comandos Básicos del Servidor',
        category: 'guias_generales',
        content: `## Comandos Esenciales de CrystalTides SMP

Los comandos principales disponibles para los jugadores son:

- \`/spawn\` - Teletransportarte al punto de aparición principal (Spawn).
- \`/sethome <nombre>\` - Guardar tu punto de teletransporte personal.
- \`/home <nombre>\` - Teletransportarte a tu hogar guardado.
- \`/delhome <nombre>\` - Eliminar un hogar guardado.
- \`/homes\` - Ver tu lista de hogares disponibles.
- \`/tpa <jugador>\` - Enviar solicitud de teletransporte a un amigo.
- \`/tpaccept\` - Aceptar solicitud de teletransporte entrante.

### Reglas de Convivencia
1. No utilizar hacks, cheats ni clientes modificados no autorizados.
2. Respetar a la comunidad y el comercio de KilluCoins.`,
        author_id: 'system',
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
    },
    {
        id: 102,
        slug: 'economia-kc',
        title: 'Guía del Sistema Económico y KilluCoins (KC)',
        category: 'guias_generales',
        content: `## Guía de Economía Bursátil y KilluCoins (KC)

Las **KilluCoins (KC)** son la moneda oficial del servidor. Puedes obtener saldo de las siguientes formas:

- **Caza de Jefes & Mobs**: Elimina entidades en mazmorras para recibir KC al instante.
- **Sugerencias Aprobadas**: Envía propuestas en la pestaña \`/suggestions\` para recibir +100 KC inmediatos y +500 KC al ser aprobadas por la IA.
- **Comercio en la Bolsa**: Vende minerales y recursos en el Mercado Dinámico.`,
        author_id: 'system',
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-08-01T00:00:00Z'
    }
]
