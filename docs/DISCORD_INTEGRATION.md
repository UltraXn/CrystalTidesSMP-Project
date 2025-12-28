# Discord Integration & Bot Architecture

CrystalTides integrates deeply with Discord to provide a seamless experience between the Minecraft Server, the Web Platform, and the Community Discord.

## 1. The Discord Bot (`apps/discord-bot`)

The bot handles two-way communication and community management utilities.

- **Stack**: TypeScript, Discord.js v14, Bun Runtime.
- **Database**: Direct connection to MySQL (Shared `verification_codes` table).

### Commands

| Command | Description                                                  | Permissions |
| :------ | :----------------------------------------------------------- | :---------- |
| `/link` | Generates a 6-character code to link Discord to Web Account. | Public      |
| `/ping` | Checks bot latency and connectivity.                         | Public      |

## 2. Account Linking System

A secure, code-based flow to bind a Discord User to a CrystalTides Web Profile.

### The Flow

1. **User** executes `/link` in Discord.
2. **Bot** generates a code (e.g. `X7K9P2`) and saves it to MySQL `verification_codes` (Expires in 10m).
3. **User** enters code in the Web Dashboard (`/profile/edit`).
4. **Web Server** (`POST /api/discord/link`) verifies the code against MySQL.
5. **Result**:
   - Authenticated User's metadata in Supabase is updated with `discord_id` and `discord_username`.
   - The code is consumed (deleted).

## 3. News Feed Integration

News posts created on the web platform are automatically announced to Discord.

### Configuration

- **Controller**: `apps/web-server/controllers/newsController.ts`
- **Trigger**: Creating news with status `Published`.
- **Environment**: `DISCORD_NEWS_WEBHOOK_URL` (Specific channel).

### Payload Structure

The webhook sends a rich Embed and specific role pings outside the embed for notifications.

```json
{
  "content": "<@&1272263167090626712> <@&1288691873812320349>",
  "embeds": [
    {
      "title": "📢 [News Title]",
      "url": "https://crystaltides.com/news/[slug]",
      "color": 43691,
      "description": "[News Content Truncated...]",
      "footer": { "text": "CrystalTides News" },
      "image": { "url": "[Image URL]" }
    }
  ]
}
```

## 4. Security

- **Rate Limiting**: Critical endpoints (`/link`, commands) are protected by `sensitiveActionLimiter` (30 req/hr).
- **Command Restrictions**: The `/op` command (via CrystalBridge) is strictly whitelisted in code for Owners (`neroferno`, `killuwu`).
