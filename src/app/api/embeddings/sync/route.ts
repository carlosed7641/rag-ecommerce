import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { syncPendingEmbeddings } from "@/lib/embeddings";

// Recalcula embeddings pendientes (embedding_updated_at = null). Se puede
// llamar a mano desde /admin, o disparar fire-and-forget tras crear/editar
// un producto para que el catálogo del chat no quede desactualizado.
export async function POST() {
  await requireAdmin();

  try {
    const result = await syncPendingEmbeddings();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
