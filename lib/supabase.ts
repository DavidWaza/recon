import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseKey = supabaseServiceRoleKey ?? supabaseAnonKey;

if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env.local before starting the app."
  );
}

if (!supabaseKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add one to .env.local before starting the app."
  );
}

if (!supabaseServiceRoleKey) {
  // Use the anon key as a fallback for local development if the service role key is not available.
  // For production, set SUPABASE_SERVICE_ROLE_KEY in .env.local to use a secure server-side client.
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to NEXT_PUBLIC_SUPABASE_ANON_KEY for the admin client."
  );
}

// NEVER expose this on the client — server-side only
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);