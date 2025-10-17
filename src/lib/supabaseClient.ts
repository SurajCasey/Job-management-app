import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or ANON key is missing. Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,       // ✅ Keeps user logged in after refresh
    autoRefreshToken: true,     // ✅ Refreshes session automatically
    detectSessionInUrl: true,   // ✅ Handles redirects properly
  },
});
