import { createClient } from "@supabase/supabase-js";

// Pakai service role key untuk bypass RLS — hanya dipakai di server-side API routes
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
