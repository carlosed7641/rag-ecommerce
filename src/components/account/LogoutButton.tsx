"use client";

import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Recarga completa (no router.push): evita que quede una versión en
    // caché de una página protegida como si el usuario siguiera autenticado.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intencional
    window.location.assign("/");
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded border border-line-strong px-3 py-1.5 font-mono text-xs text-ink hover:border-copper hover:text-copper"
    >
      Cerrar sesión
    </button>
  );
}
