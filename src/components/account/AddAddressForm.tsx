"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AddAddressForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("addresses").insert({
      user_id: userId,
      line1: String(formData.get("line1") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? "") || null,
      zip: String(formData.get("zip") ?? ""),
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="font-mono text-xs text-copper hover:text-copper-ink"
      >
        + Añadir dirección
      </button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 rounded border border-line bg-surface p-4"
    >
      <input
        name="line1"
        required
        placeholder="Calle y número"
        className="rounded border border-line-strong bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-copper"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          name="city"
          required
          placeholder="Ciudad"
          className="rounded border border-line-strong bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-copper"
        />
        <input
          name="state"
          placeholder="Departamento"
          className="rounded border border-line-strong bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-copper"
        />
      </div>
      <input
        name="zip"
        required
        placeholder="Código postal"
        className="rounded border border-line-strong bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-copper"
      />
      {error && <p className="font-mono text-xs text-copper">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-copper bg-copper px-4 py-2 text-xs font-semibold text-[#faf6f1] hover:bg-copper-ink disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar dirección"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded border border-line-strong px-4 py-2 text-xs text-ink hover:border-copper hover:text-copper"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
