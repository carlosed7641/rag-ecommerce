"use client";

import { useCartCount } from "@/store/cart";
import { useIsClient } from "@/lib/useIsClient";

/**
 * El carrito vive en localStorage, así que el conteo real solo existe en el
 * cliente. useIsClient evita el mismatch de hidratación entre el HTML del
 * servidor (siempre 0) y el primer render del cliente.
 */
export function CartBadge() {
  const count = useCartCount();
  const isClient = useIsClient();

  return <>{isClient ? count : 0}</>;
}
