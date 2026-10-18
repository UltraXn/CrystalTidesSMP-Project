-- Migration: Add gacha_balance column to linked_accounts table
-- Target DB: MySQL 8.0+ (Minecraft DB)
-- Note: In production this column likely already exists, as legacy server code
-- attempted creation on every application startup.

SET @dbname = DATABASE();
SET @tablename = 'linked_accounts';
SET @columnname = 'gacha_balance';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1 /* column gacha_balance already exists */',
  'ALTER TABLE linked_accounts ADD COLUMN gacha_balance BIGINT DEFAULT 0 AFTER web_user_id'
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
