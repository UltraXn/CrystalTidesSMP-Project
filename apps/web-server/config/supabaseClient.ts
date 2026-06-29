
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || (process.env.NODE_ENV === 'test' ? 'https://placeholder-supabase-url.supabase.co' : '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env.NODE_ENV === 'test' ? 'placeholder-key-value-for-testing' : '');

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or Key missing in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
