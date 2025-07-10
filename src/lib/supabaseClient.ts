
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

if (!supabaseUrl) {
  console.error("CRITICAL: Missing environment variable NEXT_PUBLIC_SUPABASE_URL. Supabase client cannot be initialized. Please set this in your .env.local file.");
} else if (!supabaseAnonKey) {
  console.error("CRITICAL: Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY. Supabase client cannot be initialized. Please set this in your .env.local file.");
} else {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("CRITICAL: Error initializing Supabase client:", error);
  }
}

export const supabase = client;
