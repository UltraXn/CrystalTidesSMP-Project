# ⚡ CrystalTides Web Server (API)

La **API Central** del ecosistema CrystalTides. Este servicio actúa como orquestador, conectando el Frontend, el Servidor de Minecraft, Discord y servicios de terceros.

## 🏗️ Stack Tecnológico

- **Runtime**: Node.js 20+ (TypeScript).
- **Framework**: Express.js con arquitectura de controladores y servicios.
- **Base de Datos**: 
    - **Supabase (PostgreSQL)**: Persistencia de datos web (Usuarios, Posts, Tickets).
    - **MySQL**: Conexión de lectura/escritura a bases de datos del servidor de juego (LuckPerms, CoreProtect, Economy).
- **Seguridad**: JWT (Supabase Auth), Helmet, Rate Limiting, CORS estricto.

## 🔌 Módulos y Arquitectura

### 1. Sistema de Autenticación & Vinculación
Maneja el flujo de registro híbrido:
1.  **Auth Social**: Login vía Google/Discord (Supabase).
2.  **Vinculación MC**: Validación de propiedad de cuenta de Minecraft mediante código de un solo uso (generado in-game o vía Discord Bot).
3.  **Sync**: Sincronización automática de avatares, roles y nicknames.

### 2. CrystalBridge (Gateway de Comandos)
Implementa el patrón **Command Queue** para ejecutar acciones en el servidor de Minecraft de forma segura y asíncrona, sin exponer RCON.
- **Flujo**: API -> Insert en Tabla SQL `pending_commands` -> Plugin CrystalCore (Polling) -> Ejecución -> Update Estado.
- **Usos**: Entrega de premios Gacha, Sincronización de rangos, Mensajes de sistema.

### 3. Agregador de Estadísticas (Data Aggregator)
Servicio optimizado que consulta múltiples fuentes para construir el perfil del jugador:
- **CoreProtect DB**: Conteo masivo de bloques (raw SQL queries optimizadas).
- **LuckPerms DB**: Obtención de grupos y pesos de rango.
- **Vault/Economy DB**: Lectura de balances financieros.

### 4. Integraciones Externas
- **Pterodactyl**: Control de energía del servidor (Start/Stop/Restart) via Client API.
- **Twitch**: Webhooks para alertas de stream y obtención de Clips.
- **Google Calendar**: Sincronización de eventos del Staff.

## 🚀 Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Configuración
# Copiar .env.example a .env y rellenar credenciales:
# - SUPABASE_URL / KEY
# - MYSQL_HOST / USER / PASS (Game Server)
# - PTERODACTYL_API_KEY
# - DISCORD_CLIENT_ID / SECRET

# Iniciar en modo desarrollo (Watch Mode)
# Puerto default: 3000
npm run dev

# Compilar y ejecutar (Producción)
npm run build
npm start
```

## 📂 Estructura

```
src/
├── config/         # Configuración de DB, Swagger y Variables de Entorno
├── controllers/    # Lógica de entrada HTTP (Req/Res)
├── middleware/     # Auth, Validación (Zod), Error Handling
├── routes/         # Definición de rutas API (v1/*)
├── schemas/        # Validaciones Zod compartidas
├── services/       # Lógica de negocio y Clientes Externos (Supabase, MySQL, Twitch)
└── utils/          # Helpers y Loggers
```
