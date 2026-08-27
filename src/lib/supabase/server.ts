import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Cliente de Supabase para Server Components, route handlers y server actions.
 * Lee/escribe las cookies de sesión — mantiene al usuario autenticado
 * entre requests. Usa la publishable key (respeta RLS según el usuario).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Se puede ignorar si un Server Component intenta escribir
            // cookies — el middleware ya se encarga de refrescar la sesión.
          }
        },
      },
    },
  );
}
