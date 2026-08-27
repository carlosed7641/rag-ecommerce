import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";
import { LogoutButton } from "@/components/account/LogoutButton";
import { AddAddressForm } from "@/components/account/AddAddressForm";
import { AddressItem } from "@/components/account/AddressItem";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagada",
  shipped: "Enviada",
  cancelled: "Cancelada",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts ya protege esta ruta, pero por si acaso.
  if (!user) return null;

  const [{ data: profile }, { data: orders }, { data: addresses }] =
    await Promise.all([
      supabase.from("profiles").select("full_name, role").eq("id", user.id).single(),
      supabase
        .from("orders")
        .select("id, status, total, created_at, order_items(product_name, quantity)")
        .order("created_at", { ascending: false }),
      supabase.from("addresses").select("*").order("created_at", { ascending: false }),
    ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="break-words font-display text-2xl font-semibold text-ink">
            {profile?.full_name || "Mi cuenta"}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <section className="mb-12">
        <h2 className="mb-4 font-mono text-[0.68rem] uppercase tracking-wider text-muted">
          Direcciones
        </h2>
        <div className="flex flex-col gap-3">
          {addresses && addresses.length > 0 && (
            <ul className="flex flex-col gap-2">
              {addresses.map((a) => (
                <li key={a.id}>
                  <AddressItem address={a} />
                </li>
              ))}
            </ul>
          )}
          <AddAddressForm userId={user.id} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-mono text-[0.68rem] uppercase tracking-wider text-muted">
          Historial de órdenes
        </h2>
        {!orders || orders.length === 0 ? (
          <p className="text-sm text-muted">Todavía no tienes órdenes.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {orders.map((o) => {
              const preview = o.order_items
                .map((i) => `${i.product_name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`)
                .join(", ");
              return (
                <li key={o.id}>
                  <Link
                    href={`/cuenta/ordenes/${o.id}`}
                    className="flex items-center justify-between gap-4 rounded border border-line bg-surface px-4 py-3 hover:border-copper"
                  >
                    <div className="min-w-0">
                      <div>
                        <span className="font-mono text-xs text-muted">
                          {new Date(o.created_at).toLocaleDateString("es-CO", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="ml-3 font-mono text-xs text-signal">
                          {STATUS_LABEL[o.status] ?? o.status}
                        </span>
                      </div>
                      {preview && (
                        <p className="mt-1 truncate text-sm text-ink">{preview}</p>
                      )}
                    </div>
                    <span className="flex-none font-mono text-sm text-ink">
                      {formatCurrency(o.total)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
