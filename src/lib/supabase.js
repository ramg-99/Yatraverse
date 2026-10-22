import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fwgrexnksolmvscjdcwa.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2kwhR8WLA_GeOCAEVfM8eQ_qukqBZAr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
