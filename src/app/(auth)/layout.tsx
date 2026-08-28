import type { ReactNode } from "react";

/**
 * Layout de /login y /registro: sin header/footer de la tienda, formulario
 * centrado vertical y horizontalmente en la pantalla.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-16 md:px-8">
      {children}
    </div>
  );
}
