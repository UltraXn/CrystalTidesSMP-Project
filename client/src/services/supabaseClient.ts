
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase vars missing:', { supabaseUrl, supabaseKey })
    alert('ERROR: Faltan las claves de Supabase en client/.env. Revisa la consola.')
} else {
    console.log('Supabase init:', supabaseUrl)
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder')
