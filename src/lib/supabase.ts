import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Check if environment variables are properly set
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
        key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined'
    });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
