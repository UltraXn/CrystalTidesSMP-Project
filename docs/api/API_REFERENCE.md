# 📖 API Reference

> **Complete REST API documentation for CrystalTides**

The CrystalTides API is a RESTful API built with Express.js and TypeScript. It provides endpoints for user management, game integration, content management, and more.

---

## 🚀 Quick Start

### Base URL

```
Development: http://localhost:3001/api
Production: https://api.crystaltides.com/api
```

### Authentication

Most endpoints require authentication via JWT token:

```http
Authorization: Bearer <your-jwt-token>
```

Get your token by logging in via `/api/auth/login`.

---

## 📚 Interactive Documentation

### Swagger UI

**Live API documentation with interactive testing**:

```
http://localhost:3001/api/docs
```

The Swagger UI provides:
- ✅ Complete endpoint reference
- ✅ Request/response schemas
- ✅ Try-it-out functionality
- ✅ Authentication testing

### OpenAPI Spec

Download the OpenAPI 3.0 specification:

```
http://localhost:3001/api/docs/swagger.json
```

---

## 🔐 Authentication Endpoints

### POST `/api/auth/register`

Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "PlayerName"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "PlayerName"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST `/api/auth/login`

Authenticate and receive JWT token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "PlayerName",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST `/api/auth/discord`

Authenticate via Discord OAuth.

**Request Body**:
```json
{
  "code": "discord-oauth-code"
}
```

---

## 👤 User Endpoints

### GET `/api/users/:username`

Get public user profile.

**Response** (200 OK):
```json
{
  "id": "uuid",
  "username": "PlayerName",
  "avatar_url": "https://...",
  "role": "user",
  "minecraft_uuid": "...",
  "created_at": "2026-01-01T00:00:00Z"
}
```

### GET `/api/users/me`

Get authenticated user's profile (requires auth).

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "PlayerName",
  "discord_id": "...",
  "minecraft_uuid": "...",
  "role": "user"
}
```

### PATCH `/api/users/me`

Update authenticated user's profile.

**Request Body**:
```json
{
  "username": "NewUsername",
  "avatar_url": "https://..."
}
```

---

## 📰 News Endpoints

### GET `/api/news`

Get published news articles.

**Query Parameters**:
- `category` (optional): Filter by category
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Pagination offset

**Response** (200 OK):
```json
{
  "news": [
    {
      "id": "uuid",
      "title": "Server Update 1.0",
      "content": "...",
      "category": "update",
      "author": {
        "username": "Admin",
        "avatar_url": "..."
      },
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 50
}
```

### GET `/api/news/:id`

Get single news article.

### POST `/api/news`

Create news article (admin only).

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Request Body**:
```json
{
  "title": "New Event Announced",
  "content": "Full article content...",
  "category": "event",
  "published": true
}
```

---

## 🎰 Gacha Endpoints

### POST `/api/gacha/roll`

Perform a gacha roll (requires auth + linked Minecraft account).

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "result": {
    "item": "Diamond Sword",
    "rarity": "legendary",
    "quantity": 1
  },
  "balance": 450
}
```

**Error** (400 Bad Request):
```json
{
  "error": "Insufficient balance"
}
```

### GET `/api/gacha/history`

Get user's gacha roll history.

**Response** (200 OK):
```json
{
  "history": [
    {
      "id": "uuid",
      "item": "Diamond Sword",
      "rarity": "legendary",
      "rolled_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

## 📊 Player Stats Endpoints

### GET `/api/stats/:username`

Get Minecraft player statistics.

**Response** (200 OK):
```json
{
  "username": "PlayerName",
  "uuid": "minecraft-uuid",
  "playtime": 12345,
  "blocks_mined": 5000,
  "blocks_placed": 3000,
  "rank": "VIP",
  "last_seen": "2026-01-10T00:00:00Z"
}
```

---

## 🎫 Ticket Endpoints

### GET `/api/tickets`

Get user's support tickets (requires auth).

### POST `/api/tickets`

Create a new support ticket.

**Request Body**:
```json
{
  "title": "Bug Report",
  "description": "Detailed description...",
  "priority": "medium"
}
```

### GET `/api/tickets/:id`

Get specific ticket details.

### PATCH `/api/tickets/:id`

Update ticket (staff only).

---

## 🔗 Account Linking Endpoints

### POST `/api/link/request`

Request a link code to connect Minecraft account.

**Response** (200 OK):
```json
{
  "code": "ABC123",
  "expires_at": "2026-01-10T01:00:00Z"
}
```

### POST `/api/link/verify`

Verify and complete account linking.

**Request Body**:
```json
{
  "code": "ABC123"
}
```

---

## ⚙️ Admin Endpoints

### GET `/api/admin/users`

List all users (admin only).

### PATCH `/api/admin/users/:id/role`

Update user role.

**Request Body**:
```json
{
  "role": "moderator"
}
```

### POST `/api/admin/commands`

Queue a Minecraft command for execution.

**Request Body**:
```json
{
  "command": "give PlayerName diamond 64"
}
```

---

## 📡 WebSocket Events

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3001')

ws.onopen = () => {
  console.log('Connected to CrystalTides WebSocket')
}
```

### Events

**Server → Client**:

```javascript
// Command refresh notification
{
  "type": "REFRESH_COMMANDS"
}

// News update
{
  "type": "NEWS_UPDATE",
  "data": {
    "id": "uuid",
    "title": "New Article"
  }
}

// User status change
{
  "type": "USER_STATUS",
  "data": {
    "username": "PlayerName",
    "online": true
  }
}
```

**Client → Server**:

```javascript
// Heartbeat
ws.send('ping')
// Response: 'pong'
```

---

## 🚨 Error Responses

### Standard Error Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## 🔒 Rate Limiting

**Default Limits**:
- **Authentication**: 5 requests/minute per IP
- **API Endpoints**: 100 requests/minute per user
- **Gacha Rolls**: 10 requests/minute per user

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704931200
```

---

## 📦 Response Pagination

For endpoints that return lists:

**Query Parameters**:
```
?limit=20&offset=0
```

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","username":"TestUser"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get profile (with token)
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import the OpenAPI spec from `/api/docs/swagger.json`
2. Set up environment variables for `base_url` and `token`
3. Use the pre-configured requests

---

## 📚 Related Documentation

- [[Supabase Integration](../architecture/SUPABASE_INTEGRATION.md)] - Database and auth
- [[Web Server](../components/WEB_SERVER.md)] - Backend implementation
- [[WebSocket Events](./WEBSOCKET_EVENTS.md)] - Real-time communication
- [[Authentication](./AUTHENTICATION.md)] - Auth flows

---

## 🔗 External Resources

- [Swagger UI](http://localhost:3001/api/docs) - Interactive documentation
- [OpenAPI Specification](https://swagger.io/specification/)
- [Express.js Documentation](https://expressjs.com/)

---

_Last updated: January 10, 2026_
