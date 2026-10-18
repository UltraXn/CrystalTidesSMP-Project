-- Migration: Add gacha_balance column to linked_accounts table
-- Target DB: MySQL (Minecraft DB)
-- Replaces top-level DDL execution formerly in minecraftController.ts

ALTER TABLE linked_accounts 
    ADD COLUMN IF NOT EXISTS gacha_balance BIGINT DEFAULT 0 AFTER web_user_id;
