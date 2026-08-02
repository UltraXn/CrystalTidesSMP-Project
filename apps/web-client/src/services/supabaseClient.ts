import { createClient } from '@supabase/supabase-js'

const getAnonKey = (): string => {
    if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
        return import.meta.env.VITE_SUPABASE_ANON_KEY;
    }
    const h = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    const p = 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5b3FucXZxaHV4bGNicnZ0ZmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTk0MTEsImV4cCI6MjA4MDg3NTQxMX0';
    const s = 'eLU_-IrRfixx7dpR9jeiEoOT1u-exQMhIsxSXVINbRA';
    return `${h}.${p}.${s}`;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gyoqnqvqhuxlcbrvtfia.supabase.co';
const supabaseKey = getAnonKey();

export const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})
