# 🚀 Local Setup Guide

> **Get CrystalTides running on your local machine**

This guide will help you set up the complete CrystalTides development environment.

---

## 📋 Prerequisites

### Required Software

- **Node.js** 22+ ([Download](https://nodejs.org/))
- **npm** 11+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Docker** (optional, for MySQL) ([Download](https://www.docker.com/))
- **Java JDK** 21+ (for Minecraft plugin) ([Download](https://adoptium.net/))
- **Flutter** 3.24+ (for launcher) ([Download](https://flutter.dev/))
- **Rust** 1.75+ (for native components) ([Download](https://rustup.rs/))

### Accounts Needed

- **Supabase Account** ([Sign up](https://supabase.com/))
- **Discord Developer Account** ([Sign up](https://discord.com/developers/))
- **Google Cloud Account** (optional, for deployment)

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/crystaltides/crystaltides.git
cd crystaltides
```

---

## 2️⃣ Install Dependencies

### Install Turborepo globally

```bash
npm install -g turbo
```

### Install all workspace dependencies

```bash
npm install
```

This will install dependencies for all apps and packages in the monorepo.

---

## 3️⃣ Environment Configuration

### Create Environment Files

Each app needs its own `.env` file. Use the templates provided:

```bash
# Web Client
cp apps/web-client/.env.example apps/web-client/.env

# Web Server
cp apps/web-server/.env.example apps/web-server/.env

# Discord Bot
cp apps/discord-bot/.env.example apps/discord-bot/.env
```

### Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com/)
2. Get your project URL and anon key from Settings → API
3. Update `apps/web-client/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Get your service role key (Settings → API)
5. Update `apps/web-server/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Configure MySQL (Local)

**Option A: Docker** (Recommended)

```bash
docker run -d \
  --name crystaltides-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=crystaltides \
  -p 3306:3306 \
  mysql:8.0
```

**Option B: Local MySQL**

Install MySQL 8.0+ and create a database:

```sql
CREATE DATABASE crystaltides;
```

Update `apps/web-server/.env`:

```env
MC_DB_HOST=localhost
MC_DB_USER=root
MC_DB_PASSWORD=root
MC_DB_DATABASE=crystaltides
```

### Configure Discord Bot

1. Create a new application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Go to Bot → Add Bot
3. Copy the bot token
4. Update `apps/discord-bot/.env`:

```env
DISCORD_TOKEN=your-bot-token
DISCORD_CLIENT_ID=your-client-id
```

---

## 4️⃣ Database Setup

### Run Supabase Migrations

```bash
cd apps/web-server
npx supabase db push
```

### Seed MySQL Database

```bash
cd apps/web-server
npm run db:seed
```

---

## 5️⃣ Build Native Components

### Build Launcher Native Core (Rust)

```bash
cd apps/launcher/native
cargo build --release
```

The compiled library will be in `target/release/`.

### Build Game Agent (Rust + Java)

```bash
cd apps/game-bridge

# Build Rust core
cd native-core
cargo build --release

# Build Java agent
cd ../java-agent
./gradlew shadowJar
```

---

## 6️⃣ Start Development Servers

### Start All Services (Recommended)

```bash
# From root directory
turbo dev
```

This starts:
- **Web Client**: http://localhost:5173
- **Web Server**: http://localhost:3001
- **Discord Bot**: Running in background

### Start Individual Services

**Web Client Only**:
```bash
cd apps/web-client
npm run dev
```

**Web Server Only**:
```bash
cd apps/web-server
npm run dev
```

**Discord Bot Only**:
```bash
cd apps/discord-bot
bun run src/index.ts
```

---

## 7️⃣ Build Minecraft Plugin

```bash
cd plugins/crystalcore
./gradlew shadowJar
```

The compiled plugin will be in `build/libs/CrystalCore-*.jar`.

### Install Plugin

1. Copy the JAR to your Minecraft server's `plugins/` folder
2. Restart the server
3. Configure `plugins/CrystalCore/config.yml`

---

## 8️⃣ Verify Setup

### Check Web Client

1. Open http://localhost:5173
2. You should see the CrystalTides landing page
3. Try registering a new account

### Check Web Server

1. Open http://localhost:3001/api/health
2. You should see: `{"status": "ok"}`

### Check Discord Bot

1. Invite the bot to your test server
2. Run `/ping` command
3. Bot should respond with "Pong!"

---

## 🛠️ Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Find process using port 5173
lsof -i :5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Supabase Connection Errors

1. Verify your Supabase URL and keys
2. Check if your IP is allowed (Supabase Dashboard → Settings → API)
3. Ensure RLS policies are set up correctly

### MySQL Connection Errors

1. Verify MySQL is running: `docker ps` or `mysql --version`
2. Check credentials in `.env`
3. Ensure database exists: `SHOW DATABASES;`

### Build Errors

**Rust**:
```bash
# Update Rust
rustup update

# Clean build
cargo clean
cargo build --release
```

**Node.js**:
```bash
# Clear cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

- **[Architecture Overview](../architecture/OVERVIEW.md)** - Understand the system
- **[Contributing Guidelines](./CONTRIBUTING.md)** - How to contribute
- **[API Documentation](../api/API_REFERENCE.md)** - Explore the API

---

## 🆘 Need Help?

- **Discord**: [Join our server](https://discord.gg/crystaltides)
- **GitHub Issues**: [Report a problem](https://github.com/crystaltides/crystaltides/issues)

---

_Last updated: January 10, 2026_
