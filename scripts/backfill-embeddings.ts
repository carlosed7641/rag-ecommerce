/**
 * Recalcula embeddings de todos los productos pendientes (embedding_updated_at
 * = null) — pensado para el catálogo inicial (seed) o para reprocesar todo
 * si cambia el modelo. El sync incremental normal ya corre solo desde el CMS.
 *
 * Uso: npm run backfill-embeddings
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { syncPendingEmbeddings } from "../src/lib/embeddings";

async function main() {
  console.log("Buscando productos con embedding pendiente...");
  const { updated } = await syncPendingEmbeddings();
  console.log(`Listo: ${updated} producto(s) actualizado(s).`);
}

main().catch((err) => {
  console.error("Falló el backfill de embeddings:", err);
  process.exit(1);
});
