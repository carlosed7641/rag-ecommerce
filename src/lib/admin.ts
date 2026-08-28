import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Guard de servidor para rutas /admin/*. El proxy (middleware) ya exige
 * sesión iniciada; esto además exige profiles.role = 'admin'. Se llama
 * desde el layout del servidor porque el middleware por sí solo no
 * alcanza a leer la tabla profiles de forma confiable en cada request.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return { user, profile };
}
