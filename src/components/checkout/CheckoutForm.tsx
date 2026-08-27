"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, useCartSubtotal } from "@/store/cart";
import { useIsClient } from "@/lib/useIsClient";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

type Address = Tables<"addresses">;

export function CheckoutForm({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const isClient = useIsClient();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const subtotal = useCartSubtotal();

  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(
    addresses[0]?.id ?? "new",
  );
  const [couponCode, setCouponCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isClient) return null;

  if (items.length === 0) {
    return (
      <p className="text-muted">
        Tu carrito está vacío — no hay nada que pagar.
      </p>
    );
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const shippingAddress =
      selectedAddressId === "new"
        ? {
            line1: String(formData.get("line1") ?? ""),
            city: String(formData.get("city") ?? ""),
            state: String(formData.get("state") ?? "") || null,
            zip: String(formData.get("zip") ?? ""),
            country: "CO",
          }
        : (() => {
            const a = addresses.find((x) => x.id === selectedAddressId)!;
            return {
              line1: a.line1,
              city: a.city,
              state: a.state,
              zip: a.zip,
              country: a.country,
            };
          })();

    if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.zip) {
      setError("Completa la dirección de envío.");
      setPending(false);
      return;
    }

    const supabase = createClient();
    const { data: orderId, error: rpcError } = await supabase.rpc("create_order", {
      p_items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
      p_shipping_address: shippingAddress,
      p_coupon_code: couponCode.trim() || undefined,
    });

    setPending(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    clearCart();
    router.push(`/checkout/confirmacion/${orderId}`);
  }

  return (
    <form action={handleSubmit} className="grid gap-10 md:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="mb-3 font-mono text-[0.68rem] uppercase tracking-wider text-muted">
            Dirección de envío
          </h2>
          <div className="flex flex-col gap-2">
            {addresses.map((a) => (
              <label
                key={a.id}
                className="flex cursor-pointer items-start gap-3 rounded border border-line bg-surface px-4 py-3 text-sm has-[:checked]:border-copper"
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === a.id}
                  onChange={() => setSelectedAddressId(a.id)}
                  className="mt-1"
                />
                <span>
                  {a.line1}, {a.city}
                  {a.state ? `, ${a.state}` : ""} — {a.zip}
                </span>
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-3 rounded border border-line bg-surface px-4 py-3 text-sm has-[:checked]:border-copper">
              <input
                type="radio"
                name="address"
                checked={selectedAddressId === "new"}
                onChange={() => setSelectedAddressId("new")}
              />
              Usar una dirección nueva
            </label>
          </div>

          {selectedAddressId === "new" && (
            <div className="mt-3 flex flex-col gap-3">
              <input
                name="line1"
                required
                placeholder="Calle y número"
                className="rounded border border-line-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-copper"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="city"
                  required
                  placeholder="Ciudad"
                  className="rounded border border-line-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-copper"
                />
                <input
                  name="state"
                  placeholder="Departamento"
                  className="rounded border border-line-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-copper"
                />
              </div>
              <input
                name="zip"
                required
                placeholder="Código postal"
                className="rounded border border-line-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-copper"
              />
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 font-mono text-[0.68rem] uppercase tracking-wider text-muted">
            Cupón (opcional)
          </h2>
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Código de descuento"
            className="w-full max-w-xs rounded border border-line-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-copper"
          />
        </div>
      </div>

      <div className="flex h-fit flex-col gap-4 rounded border border-line bg-surface p-5">
        <h2 className="font-mono text-[0.68rem] uppercase tracking-wider text-muted">
          Resumen
        </h2>
        <ul className="flex flex-col gap-2 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-2">
              <span className="text-ink">
                {i.name} × {i.quantity}
              </span>
              <span className="font-mono text-muted">
                {formatCurrency(i.price * i.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-line pt-3 font-mono text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="text-ink">{formatCurrency(subtotal)}</span>
        </div>

        {error && <p className="font-mono text-xs text-copper">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded border border-copper bg-copper px-6 py-3 text-sm font-semibold text-[#faf6f1] transition-colors hover:bg-copper-ink disabled:opacity-60"
        >
          {pending ? "Procesando…" : "Confirmar compra"}
        </button>
      </div>
    </form>
  );
}
