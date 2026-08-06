-- 1. Recolector de Chismes de Discord con Retención de 72 Horas
CREATE TABLE IF NOT EXISTS discord_chat_stream (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message_id VARCHAR(64) UNIQUE NOT NULL,
    reply_to_message_id VARCHAR(64), -- ID del mensaje padre si es una respuesta
    channel_name VARCHAR(50) NOT NULL,
    author_username VARCHAR(100) NOT NULL,
    author_id VARCHAR(64) NOT NULL,
    content TEXT NOT NULL,
    reaction_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para acelerar búsquedas de referencias de mensajes (Hilos de respuesta)
CREATE INDEX IF NOT EXISTS idx_discord_chat_stream_message_id ON discord_chat_stream(message_id);
CREATE INDEX IF NOT EXISTS idx_discord_chat_stream_created_at ON discord_chat_stream(created_at);

-- 2. Buffer temporal de eventos in-game (Combates, logros, economía)
CREATE TABLE IF NOT EXISTS ai_event_stream (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- 'boss_fight', 'achievement', 'economy_trade', 'banquet'
    player_uuid VARCHAR(64),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_event_stream_type ON ai_event_stream(event_type);

-- 3. Periódicos Históricos del Noticiero Amarillista
CREATE TABLE IF NOT EXISTS ai_newspaper_editions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    issue_number INT NOT NULL,
    issue_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
    headline TEXT NOT NULL,
    front_page_summary TEXT NOT NULL,
    full_markdown TEXT NOT NULL,
    mvp_player_uuid VARCHAR(64),
    likes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Misiones Diarias del Dungeon Master
CREATE TABLE IF NOT EXISTS ai_daily_quests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quest_type VARCHAR(30) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    objectives JSONB NOT NULL,
    reward_kc INT NOT NULL DEFAULT 100,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_daily_quests_date ON ai_daily_quests(quest_date);
