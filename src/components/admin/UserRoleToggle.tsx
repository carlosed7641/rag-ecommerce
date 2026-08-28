"use client";

import { useTransition } from "react";
import { setUserRole } from "@/app/admin/usuarios/actions";

export function UserRoleToggle({
  userId,
  role,
  isSelf,
}: {
  userId: string;
  role: "customer" | "admin";
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (isSelf) {
    return <span className="text-xs text-muted">Tú</span>;
  }

  const nextRole = role === "admin" ? "customer" : "admin";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const label = nextRole === "admin" ? "promover a admin" : "quitarle el rol de admin";
        if (!window.confirm(`¿Seguro que quieres ${label} a este usuario?`)) return;
        startTransition(() => setUserRole(userId, nextRole));
      }}
      className="text-xs font-semibold text-copper hover:text-copper-ink disabled:opacity-60"
    >
      {pending ? "Guardando…" : nextRole === "admin" ? "Hacer admin" : "Quitar admin"}
    </button>
  );
}
