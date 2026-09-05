import { http, HttpResponse } from 'msw';

export const handlers = [
  // Server resources & telemetry
  http.get('*/api/server/resources', () => {
    return HttpResponse.json({
      cpu: 24.5,
      memory: { used: 4096, total: 16384 },
      disk: { used: 120, total: 500 },
      playersOnline: 42,
      uptime: 128400,
    });
  }),

  // Server status (Minecraft Ping)
  http.get('*/api/server/status', () => {
    return HttpResponse.json({
      online: true,
      players: { online: 42, max: 100 },
      version: '1.20.1 Fabric',
      motd: '§bCrystalTides SMP §7- Temporada 2',
      latency: 28,
    });
  }),

  // Staff listing
  http.get('*/api/staff', () => {
    return HttpResponse.json({
      data: [
        { id: '1', name: 'NachoDev', role: 'Administrador', avatar: 'https://mc-heads.net/avatar/NachoDev' },
        { id: '2', name: 'AuraKeeper', role: 'Moderador', avatar: 'https://mc-heads.net/avatar/AuraKeeper' },
      ],
    });
  }),

  // Admin Tasks
  http.get('*/api/tasks', () => {
    return HttpResponse.json([
      { id: 'task-1', title: 'Actualizar modpack v1.4', status: 'done', priority: 'high' },
      { id: 'task-2', title: 'Configurar evento de Halloween', status: 'in_progress', priority: 'medium' },
    ]);
  }),

  // News & Announcements
  http.get('*/api/news', () => {
    return HttpResponse.json({
      data: [
        {
          id: 'news-1',
          title: 'Apertura de la Gran Biblioteca de Cristal',
          slug: 'apertura-biblioteca',
          excerpt: 'Descubre los nuevos secretos arcanos en la actualización.',
          created_at: '2026-09-01T12:00:00Z',
          author: 'CrystalTides Staff',
        },
      ],
    });
  }),

  // World Locations
  http.get('*/api/locations', () => {
    return HttpResponse.json([
      {
        id: 1,
        title: 'Gran Biblioteca de Cristal',
        description: 'Antiguo repositorio de sabiduría abisal.',
        x: 100,
        y: 64,
        z: -250,
        dimension: 'overworld',
        tags: ['PDI', 'Lore'],
        authors: ['NachoDev'],
      },
    ]);
  }),

  // Launcher versions
  http.get('*/api/launcher/versions', () => {
    return HttpResponse.json([
      {
        id: '1.20.1-fabric',
        name: 'Crystal Client 1.20.1 Fabric',
        loader: 'fabric',
        loaderVersion: '0.15.11',
        mcVersion: '1.20.1',
        recommended: true,
      },
    ]);
  }),
];
