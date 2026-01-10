# 📚 CrystalTides Documentation

> **Comprehensive documentation for the CrystalTides SMP ecosystem**

CrystalTides is a full-stack Minecraft SMP ecosystem that integrates a modern web platform, native launcher, and advanced in-game features through a hybrid architecture combining React, Node.js, Flutter, Rust, and Java.

---

## 🚀 Quick Start

- **[Local Setup Guide](./getting-started/SETUP.md)** - Get the development environment running
- **[Deployment Guide](./getting-started/DEPLOYMENT.md)** - Deploy to production (GCP/Cloud Run)
- **[Contributing Guidelines](./getting-started/CONTRIBUTING.md)** - How to contribute to the project

---

## 🏗️ Architecture

### Core Architecture
- **[System Overview](./architecture/OVERVIEW.md)** - High-level architecture and component interaction
- **[Crystal Bridge](./architecture/CRYSTAL_BRIDGE.md)** - Web ↔ Minecraft communication (WebSocket + MySQL)
- **[Rust-Java Bridge](./architecture/RUST_JAVA_BRIDGE.md)** - Native FFI/JNI communication patterns
- **[Supabase Integration](./architecture/SUPABASE_INTEGRATION.md)** - Authentication, database, storage, and realtime
- **[Data Flow](./architecture/DATA_FLOW.md)** - End-to-end data flow diagrams

### Database Architecture
- **[Database Schema](./architecture/DATABASE_SCHEMA.md)** - Supabase (PostgreSQL) + MySQL dual-database system
- **[Row Level Security](./architecture/RLS_POLICIES.md)** - Supabase RLS implementation

---

## 🧩 Components

### Client-Side
- **[Web Client](./components/WEB_CLIENT.md)** - React 19 + Vite + Tailwind CSS 4
- **[Launcher](./components/LAUNCHER.md)** - Flutter + Rust native launcher
- **[Game Agent](./components/GAME_AGENT.md)** - Java Agent + Rust native core (in-game HUD)

### Server-Side
- **[Web Server](./components/WEB_SERVER.md)** - Node.js + Express API
- **[Discord Bot](./components/DISCORD_BOT.md)** - Bun + Discord.js integration
- **[CrystalCore Plugin](./components/CRYSTALCORE_PLUGIN.md)** - Paper/Spigot plugin (Java)

---

## ✨ Features

- **[Gacha System](./features/GACHA_SYSTEM.md)** - In-game reward system with web integration
- **[Forum System](./features/FORUM_SYSTEM.md)** - Community discussion platform
- **[User Profiles](./features/USER_PROFILES.md)** - Player statistics and achievements
- **[Staff Hub](./features/STAFF_HUB.md)** - Administrative dashboard and tools
- **[Account Linking](./features/ACCOUNT_LINKING.md)** - Discord ↔ Web ↔ Minecraft linking

---

## 🔧 Operations

- **[CI/CD Pipeline](./operations/CI_CD.md)** - Automated testing and deployment
- **[Monitoring & Logging](./operations/MONITORING.md)** - Application monitoring and log aggregation
- **[Security Practices](./operations/SECURITY.md)** - Security audit and best practices
- **[Troubleshooting](./operations/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Backup & Recovery](./operations/BACKUP_RECOVERY.md)** - Data backup strategies

---

## 📖 API Reference

- **[REST API Documentation](./api/API_REFERENCE.md)** - Complete API endpoint reference
- **[WebSocket Events](./api/WEBSOCKET_EVENTS.md)** - Real-time event documentation
- **[Authentication](./api/AUTHENTICATION.md)** - Auth flows and JWT handling

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite 6** - Build tool
- **Tailwind CSS 4** - Styling framework
- **Framer Motion** - Animations
- **React Router v7** - Routing

### Backend
- **Node.js 22** - Runtime
- **Express 5** - Web framework
- **Supabase** - BaaS (Auth, DB, Storage, Realtime)
- **MySQL** - Game server database

### Native
- **Flutter** - Launcher UI
- **Rust** - Native core (FFI/JNI)
- **Java 21** - Minecraft plugin

### Infrastructure
- **Turborepo** - Monorepo management
- **Docker** - Containerization
- **Google Cloud Run** - Serverless deployment
- **Holy Hosting** - Minecraft server hosting

---

## 📂 Project Structure

```
crystaltides/
├── apps/
│   ├── web-client/         # React frontend
│   ├── web-server/         # Node.js API
│   ├── discord-bot/        # Discord integration
│   └── launcher/           # Flutter launcher
├── plugins/
│   └── crystalcore/        # Minecraft plugin
├── packages/
│   ├── shared/             # Shared types and utilities
│   └── config/             # Shared configurations
└── docs/                   # This documentation
```

---

## 🔗 External Resources

- **[Master PRD](./MASTER_PRD.md)** - Product requirements document
- **[Roadmap](./roadmap/TODO.md)** - Development roadmap and tasks
- **[Code Quality Standards](./operations/CODE_QUALITY.md)** - Coding standards and best practices

---

## 📝 License

This project is proprietary software for CrystalTides SMP.

---

## 🤝 Support

For questions or issues:
- **Discord**: [CrystalTides SMP Server](https://discord.gg/crystaltides)
- **GitHub Issues**: [Report a bug](https://github.com/crystaltides/crystaltides/issues)

---

_Last updated: January 10, 2026_
