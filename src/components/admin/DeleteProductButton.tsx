"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/app/admin/productos/actions";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) {
          return;
        }
        startTransition(() => {
          deleteProduct(productId);
        });
      }}
      className="text-xs font-semibold text-muted hover:text-red-600 disabled:opacity-60"
    >
      {pending ? "Eliminando…" : "Eliminar"}
    </button>
  );
}
