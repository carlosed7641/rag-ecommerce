/**
 * Valida el destino de un `?next=` antes de redirigir tras login/registro.
 * Solo se aceptan rutas internas (empiezan con "/" y no con "//" — esto
 * último sería una redirección a otro host disfrazada de ruta relativa).
 */
export function safeRedirectTarget(next: string | null, fallback = "/cuenta") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}
