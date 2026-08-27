import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-8">
      <h1 className="mb-9 text-2xl font-extrabold text-ink">Checkout</h1>
      <CheckoutForm addresses={addresses ?? []} />
    </div>
  );
}
