import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://gyoqnqvqhuxlcbrvtfia.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY_B64 =
  "ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW1kNWIzRnVjWFp4YUhWNGJHTmljblowWm1saElpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTmpVeU9UazBNVEVzSW1WNGNDSTZNakE0TURnM05UUXhNWDAuZUxVXy1JclJmaXh4N2RwUjlqZWlFb09UMXUtZXhRTWhJc3hTWFZJTmJSQQ==";

const getSupabaseKey = (): string => {
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envKey) {
    if (envKey.startsWith("eyJ")) return envKey;
    try { return atob(envKey); } catch { return envKey; }
  }
  return atob(DEFAULT_SUPABASE_ANON_KEY_B64);
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = getSupabaseKey();

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
