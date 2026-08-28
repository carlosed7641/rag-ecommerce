import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/format";
import { CouponForm } from "@/components/admin/CouponForm";
import { CouponRowActions } from "@/components/admin/CouponRowActions";

export default async function AdminCouponsPage() {
  const supabase = await createClient();
  const { data: coupons, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-extrabold text-ink">Cupones</h1>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Usos</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono font-medium text-ink">{c.code}</td>
                  <td className="px-4 py-3 text-ink">
                    {c.type === "percent" ? `${c.value}%` : formatCurrency(Number(c.value))}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {c.used_count}
                    {c.max_uses ? ` / ${c.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        c.is_active
                          ? "rounded-full bg-signal/10 px-2.5 py-1 text-xs font-semibold text-signal"
                          : "rounded-full bg-muted/10 px-2.5 py-1 text-xs font-semibold text-muted"
                      }
                    >
                      {c.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CouponRowActions couponId={c.id} isActive={c.is_active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Todavía no hay cupones.
            </p>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            Nuevo cupón
          </h2>
          <CouponForm />
        </div>
      </div>
    </div>
  );
}
