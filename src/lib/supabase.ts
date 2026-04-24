import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Please check your .env file.')
}

// Un único cliente. Default schema: conta.
// Para leer tablas de QuickInvoice (public) usar RPC conta.lp_get_facturas_qi
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    db: { schema: 'conta' },
})
