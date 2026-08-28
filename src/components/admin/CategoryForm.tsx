"use client";

import { useActionState } from "react";
import { createCategory } from "@/app/admin/categorias/actions";
import type { Category } from "@/lib/products";

export function CategoryForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(createCategory, null);

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
          Nombre
        </span>
        <input name="name" required className="input" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
          Slug
        </span>
        <input
          name="slug"
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          title="Solo minúsculas, números y guiones"
          className="input"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
          Categoría padre (opcional)
        </span>
        <select name="parentId" defaultValue="" className="input">
          <option value="">Ninguna</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-copper px-5 py-2.5 text-sm font-semibold text-white hover:bg-copper-ink disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Crear categoría"}
      </button>
    </form>
  );
}
