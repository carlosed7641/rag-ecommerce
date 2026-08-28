"use client";

import { useTransition } from "react";
import { toggleCoupon, deleteCoupon } from "@/app/admin/cupones/actions";

export function CouponRowActions({
  couponId,
  isActive,
}: {
  couponId: string;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-3 text-xs font-semibold">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => toggleCoupon(couponId, !isActive))}
        className="text-muted hover:text-ink disabled:opacity-60"
      >
        {isActive ? "Desactivar" : "Activar"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("¿Eliminar este cupón?")) return;
          startTransition(() => deleteCoupon(couponId));
        }}
        className="text-muted hover:text-red-600 disabled:opacity-60"
      >
        Eliminar
      </button>
    </div>
  );
}
