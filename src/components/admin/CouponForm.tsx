"use client";

import { useActionState, useState } from "react";
import { createCoupon } from "@/app/admin/cupones/actions";

export function CouponForm() {
  const [state, formAction, pending] = useActionState(createCoupon, null);
  const [type, setType] = useState<"percent" | "fixed">("percent");

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
          Código
        </span>
        <input name="code" required className="input uppercase" />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            Tipo
          </span>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "percent" | "fixed")}
            className="input"
          >
            <option value="percent">Porcentaje</option>
            <option value="fixed">Monto fijo</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            Valor {type === "percent" ? "(%)" : "(COP)"}
          </span>
          <input name="value" type="number" min={0} step="1" required className="input" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
          Subtotal mínimo (COP)
        </span>
        <input name="minSubtotal" type="number" min={0} step="1" defaultValue={0} className="input" />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            Usos máximos
          </span>
          <input name="maxUses" type="number" min={1} step="1" className="input" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
            Expira
          </span>
          <input name="expiresAt" type="date" className="input" />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 accent-copper" />
        Activo
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-copper px-5 py-2.5 text-sm font-semibold text-white hover:bg-copper-ink disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Crear cupón"}
      </button>
    </form>
  );
}
