import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Cliente de Supabase con la secret key — ignora RLS por completo.
 *
 * SOLO usar en código que corre exclusivamente en el servidor
 * (route handlers, scripts, cron jobs). Nunca importar desde un
 * Client Component ni exponer SUPABASE_SECRET_KEY al navegador.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
