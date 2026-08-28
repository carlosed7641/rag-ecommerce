import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";

/**
 * Layout del grupo de rutas de la tienda pública: header (con buscador) y
 * footer. /login, /registro y /admin quedan fuera de este grupo a propósito
 * — no deben mostrar el header/buscador de la tienda. El widget de chat
 * (Fase 4) vive acá porque es de cara al cliente, no al admin.
 */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}
