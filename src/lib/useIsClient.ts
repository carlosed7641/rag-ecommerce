import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}
function getClientSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

/**
 * true solo después de hidratar en el cliente. Úsalo para cualquier UI que
 * dependa de localStorage (el carrito) — evita el mismatch de hidratación
 * sin recurrir a setState dentro de un efecto.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
