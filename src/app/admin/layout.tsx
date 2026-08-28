import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireAdmin();

  return (
    // min-h-dvh: el panel no se achica al cambiar a una página con menos
    // contenido (Dashboard vs. una tabla larga de Productos) — evita el
    // salto de layout entre tabs.
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row md:gap-10 md:px-8 md:py-10">
      <AdminNav adminName={profile?.full_name ?? "Admin"} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
