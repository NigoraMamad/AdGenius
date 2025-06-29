import { createClient } from "@supabase/supabase-js";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Client-side Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side Supabase client for API routes
export const createSupabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

// Server component client
export const createServerSupabaseClient = () =>
  createServerComponentClient({ cookies });

// Browser client for app router
export const createClientSupabaseClient = () => createBrowserSupabaseClient();
