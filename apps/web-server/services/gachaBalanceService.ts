import pool from '../config/database.js';
import supabase from '../config/supabaseClient.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface LinkedAccountRow extends RowDataPacket {
  gacha_balance: number | string | null;
  unlocked_tiers: string | null;
  minecraft_name: string | null;
}

async function syncSupabaseBalance(userId: string, balance: number): Promise<void> {
  await supabase.from('profiles').update({ gacha_balance: balance }).eq('id', userId);
}

export async function getGachaBalance(userId: string): Promise<number> {
  try {
    const [rows] = await pool.execute<LinkedAccountRow[]>(
      'SELECT gacha_balance FROM linked_accounts WHERE web_user_id = ? LIMIT 1',
      [userId],
    );

    if (rows.length > 0 && rows[0].gacha_balance != null) {
      return Number(rows[0].gacha_balance);
    }
  } catch (error) {
    console.error('[GachaBalance] MySQL read failed, falling back to Supabase:', error);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('gacha_balance')
    .eq('id', userId)
    .single();

  return Number(profile?.gacha_balance ?? 0);
}

export async function deductGachaBalance(userId: string, amount: number): Promise<number> {
  if (amount <= 0) return getGachaBalance(userId);

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE linked_accounts SET gacha_balance = gacha_balance - ? WHERE web_user_id = ? AND gacha_balance >= ?',
      [amount, userId, amount],
    );

    if (result.affectedRows > 0) {
      const [rows] = await pool.execute<LinkedAccountRow[]>(
        'SELECT gacha_balance FROM linked_accounts WHERE web_user_id = ? LIMIT 1',
        [userId],
      );
      const newBalance = Number(rows[0]?.gacha_balance ?? 0);
      await syncSupabaseBalance(userId, newBalance);
      return newBalance;
    }
  } catch (error) {
    console.error('[GachaBalance] MySQL deduct failed, trying Supabase:', error);
  }

  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const currentBalance = await getGachaBalance(userId);
    if (currentBalance < amount) {
      throw new Error('INSUFFICIENT_BALANCE');
    }

    const newBalance = currentBalance - amount;
    const { data, error } = await supabase
      .from('profiles')
      .update({ gacha_balance: newBalance })
      .eq('id', userId)
      .eq('gacha_balance', currentBalance)
      .gte('gacha_balance', amount)
      .select('gacha_balance')
      .maybeSingle();

    if (!error && data) {
      return Number(data.gacha_balance);
    }
  }

  throw new Error('BALANCE_DEDUCTION_FAILED');
}

export async function refundGachaBalance(userId: string, amount: number): Promise<void> {
  if (amount <= 0) return;

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE linked_accounts SET gacha_balance = gacha_balance + ? WHERE web_user_id = ?',
      [amount, userId],
    );

    if (result.affectedRows > 0) {
      const [rows] = await pool.execute<LinkedAccountRow[]>(
        'SELECT gacha_balance FROM linked_accounts WHERE web_user_id = ? LIMIT 1',
        [userId],
      );
      const newBalance = Number(rows[0]?.gacha_balance ?? 0);
      await syncSupabaseBalance(userId, newBalance);
      return;
    }
  } catch (error) {
    console.error('[GachaBalance] MySQL refund failed, trying Supabase:', error);
  }

  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const currentBalance = await getGachaBalance(userId);
    const newBalance = currentBalance + amount;
    const { data, error } = await supabase
      .from('profiles')
      .update({ gacha_balance: newBalance })
      .eq('id', userId)
      .eq('gacha_balance', currentBalance)
      .select('gacha_balance')
      .maybeSingle();

    if (!error && data) {
      return;
    }
  }

  console.error('[GachaBalance] Failed to credit balance after retries:', { userId, amount });
  throw new Error('BALANCE_CREDIT_FAILED');
}

export async function getUnlockedTiers(userId: string): Promise<string[]> {
  try {
    const [rows] = await pool.execute<LinkedAccountRow[]>(
      'SELECT unlocked_tiers FROM linked_accounts WHERE web_user_id = ? LIMIT 1',
      [userId],
    );

    if (rows.length === 0 || !rows[0].unlocked_tiers) return [];

    return rows[0].unlocked_tiers
      .replace(/[[\]"]/g, '')
      .split(',')
      .map((tier) => tier.trim().toLowerCase())
      .filter(Boolean);
  } catch (error) {
    console.error('[GachaBalance] Failed to read unlocked tiers:', error);
    return [];
  }
}

export async function getLinkedMinecraftNick(userId: string): Promise<string | null> {
  try {
    const [rows] = await pool.execute<LinkedAccountRow[]>(
      'SELECT minecraft_name FROM linked_accounts WHERE web_user_id = ? LIMIT 1',
      [userId],
    );
    if (rows.length > 0 && rows[0].minecraft_name) {
      return rows[0].minecraft_name;
    }
  } catch (error) {
    console.error('[GachaBalance] MySQL nick lookup failed:', error);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('minecraft_nick')
    .eq('id', userId)
    .single();

  return profile?.minecraft_nick ?? null;
}
