"use client";

import { useTransition } from "react";
import { deleteCategory } from "@/app/admin/categorias/actions";

export function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          !window.confirm(
            "¿Eliminar esta categoría? Los productos asociados quedarán sin categoría.",
          )
        ) {
          return;
        }
        startTransition(() => {
          deleteCategory(categoryId);
        });
      }}
      className="text-xs font-semibold text-muted hover:text-red-600 disabled:opacity-60"
    >
      {pending ? "Eliminando…" : "Eliminar"}
    </button>
  );
}
