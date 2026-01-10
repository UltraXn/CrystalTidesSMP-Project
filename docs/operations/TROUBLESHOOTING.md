# 🔧 Troubleshooting Guide

> **Common issues and their solutions**

This guide covers common problems you might encounter when developing or deploying CrystalTides.

---

## 🌐 Web Client Issues

### Build Fails with "Module not found"

**Problem**: Vite can't find a module during build.

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Supabase Auth Not Working

**Problem**: Users can't log in or register.

**Symptoms**:
- "Invalid API key" error
- "Failed to fetch" errors
- Silent failures

**Solutions**:

1. **Check environment variables**:
```bash
# apps/web-client/.env
VITE_SUPABASE_URL=https://your-project.supabase.co  # Must start with https://
VITE_SUPABASE_ANON_KEY=eyJhbGc...  # Must be the anon key, not service role
```

2. **Verify Supabase project status**:
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Check if project is paused (free tier pauses after inactivity)
   - Restore project if needed

3. **Check CORS settings**:
   - Supabase Dashboard → Authentication → URL Configuration
   - Add `http://localhost:5173` to allowed URLs

### Tailwind Styles Not Applying

**Problem**: Components don't have the expected styling.

**Solution**:
```bash
# Rebuild Tailwind
npm run build:css

# Or restart dev server
npm run dev
```

---

## ⚙️ Web Server Issues

### MySQL Connection Refused

**Problem**: Server can't connect to MySQL database.

**Symptoms**:
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions**:

1. **Check if MySQL is running**:
```bash
# Docker
docker ps | grep mysql

# Local MySQL
mysql --version
mysqladmin ping
```

2. **Verify credentials**:
```env
# apps/web-server/.env
MC_DB_HOST=localhost  # or 127.0.0.1
MC_DB_PORT=3306
MC_DB_USER=root
MC_DB_PASSWORD=your-password
MC_DB_DATABASE=crystaltides
```

3. **Test connection manually**:
```bash
mysql -h localhost -u root -p
# Enter password
USE crystaltides;
SHOW TABLES;
```

### Supabase Service Role Key Not Working

**Problem**: Server-side operations fail with permission errors.

**Solution**:
```env
# apps/web-server/.env
# Make sure you're using SERVICE ROLE key, not ANON key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Starts with eyJ, much longer than anon key
```

**Verify**:
- Service role key bypasses RLS
- Only use on server-side (never expose to client)
- Get from Supabase Dashboard → Settings → API → service_role

### WebSocket Connection Fails

**Problem**: Plugin can't connect to web server via WebSocket.

**Symptoms**:
```
[WebSocket] Connection failed: Connection refused
```

**Solutions**:

1. **Check if web server is running**:
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok"}
```

2. **Verify WebSocket port**:
```typescript
// apps/web-server/index.ts
const PORT = process.env.PORT || 3001
```

3. **Check firewall**:
```bash
# Windows
netsh advfirewall firewall add rule name="CrystalTides" dir=in action=allow protocol=TCP localport=3001

# Linux
sudo ufw allow 3001/tcp
```

---

## 🤖 Discord Bot Issues

### Bot Not Responding to Commands

**Problem**: Bot is online but doesn't respond to slash commands.

**Solutions**:

1. **Re-register commands**:
```bash
cd apps/discord-bot
npm run deploy-commands
```

2. **Check bot permissions**:
   - Bot needs `applications.commands` scope
   - Invite URL: `https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands`

3. **Verify token**:
```env
# apps/discord-bot/.env
DISCORD_TOKEN=your-bot-token  # Not the client secret!
```

### Bot Crashes on Startup

**Problem**: Bot exits immediately after starting.

**Check logs**:
```bash
cd apps/discord-bot
bun run src/index.ts
# Look for error messages
```

**Common causes**:
- Invalid token
- Missing intents in Discord Developer Portal
- Database connection failure

---

## 🎮 Minecraft Plugin Issues

### Plugin Not Loading

**Problem**: CrystalCore doesn't appear in `/plugins` list.

**Solutions**:

1. **Check server version**:
   - Plugin requires Paper 1.21.1+
   - Spigot is NOT supported

2. **Verify JAR file**:
```bash
# Should be in plugins/ folder
ls plugins/CrystalCore-*.jar
```

3. **Check server logs**:
```bash
tail -f logs/latest.log
# Look for CrystalCore loading errors
```

### Commands Not Executing from Web

**Problem**: Web commands don't execute in-game.

**Symptoms**:
- Commands stay in `pending_commands` table
- No errors in logs

**Solutions**:

1. **Check WebSocket connection**:
```
[CrystalCore] WebSocket connected to ws://localhost:3001
```

2. **Verify MySQL connection**:
```yaml
# plugins/CrystalCore/config.yml
database:
  host: localhost
  port: 3306
  database: crystaltides
  username: root
  password: your-password
```

3. **Test manual command**:
```sql
INSERT INTO web_pending_commands (command, executed) 
VALUES ('say Hello from web!', 0);
```

---

## 🦀 Rust/Native Issues

### Rust Build Fails

**Problem**: `cargo build` fails with errors.

**Solutions**:

1. **Update Rust**:
```bash
rustup update stable
```

2. **Clean build**:
```bash
cargo clean
cargo build --release
```

3. **Check dependencies**:
```bash
# Install required system libraries
# macOS
brew install openssl

# Ubuntu/Debian
sudo apt-get install libssl-dev pkg-config

# Windows
# Install Visual Studio Build Tools
```

### FFI/JNI Crashes

**Problem**: Application crashes when calling native code.

**Symptoms**:
- Segmentation fault
- "JNI ERROR" messages
- Silent crashes

**Solutions**:

1. **Enable debug symbols**:
```bash
cargo build --release --features debug-symbols
```

2. **Check memory management**:
```rust
// Always free JNI references
let result = env.new_string("test").unwrap();
// Use result...
env.delete_local_ref(result);  // Don't forget this!
```

3. **Run with sanitizers**:
```bash
RUSTFLAGS="-Z sanitizer=address" cargo build
```

---

## 🚀 Deployment Issues

### Docker Build Fails

**Problem**: `docker build` fails or takes too long.

**Solutions**:

1. **Use BuildKit**:
```bash
DOCKER_BUILDKIT=1 docker build -t crystaltides-web .
```

2. **Clear Docker cache**:
```bash
docker builder prune -a
```

3. **Check .dockerignore**:
```
node_modules
.git
.env
*.log
```

### Cloud Run Deployment Fails

**Problem**: Deployment to Google Cloud Run fails.

**Solutions**:

1. **Check service account permissions**:
   - Cloud Run Admin
   - Service Account User
   - Storage Admin

2. **Verify environment variables**:
```bash
gcloud run services describe crystaltides-web \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)"
```

3. **Check logs**:
```bash
gcloud logging read "resource.type=cloud_run_revision" --limit=50
```

---

## 📊 Performance Issues

### Slow Database Queries

**Problem**: API responses are slow.

**Solutions**:

1. **Add indexes**:
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_news_published ON news(published, created_at);
```

2. **Enable query logging**:
```typescript
// apps/web-server/db/mysql.ts
const pool = mysql.createPool({
  // ...
  debug: true  // Log all queries
})
```

3. **Use connection pooling**:
```typescript
const pool = mysql.createPool({
  connectionLimit: 10,
  queueLimit: 0
})
```

### High Memory Usage

**Problem**: Application uses too much RAM.

**Solutions**:

1. **Check for memory leaks**:
```bash
# Node.js
node --inspect --max-old-space-size=4096 dist/index.js

# Open chrome://inspect
```

2. **Limit concurrent connections**:
```typescript
// apps/web-server/index.ts
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}))
```

---

## 🆘 Still Need Help?

### Before Asking for Help

1. **Check logs**:
   - Browser console (F12)
   - Server logs (`npm run dev`)
   - Minecraft server logs

2. **Search existing issues**:
   - [GitHub Issues](https://github.com/crystaltides/crystaltides/issues)

3. **Prepare information**:
   - Error messages (full stack trace)
   - Steps to reproduce
   - Environment (OS, Node version, etc.)

### Get Support

- **Discord**: [Join our server](https://discord.gg/crystaltides)
- **GitHub**: [Create an issue](https://github.com/crystaltides/crystaltides/issues/new)

---

_Last updated: January 10, 2026_
