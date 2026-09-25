@AGENTS.md

# RagTech — contexto del proyecto

Ecommerce (Next.js App Router + Supabase) con un chat de compras que usa tool calling de Claude (no RAG clásico, no text-to-SQL libre). Ver `README.md` para arquitectura completa y `PLAN.md` para el historial de decisiones y bugs corregidos.

## Comandos

- `npm run dev` — servidor de desarrollo (Turbopack)
- `npm run lint` — ESLint
- `npm run seed` — puebla el catálogo (idempotente, upsert por slug)
- `npm run backfill-embeddings` — recalcula embeddings de todo el catálogo en Voyage AI

## Reglas de seguridad no negociables

- **Nunca generar SQL crudo para las tools del chat** (`src/lib/chat/tools.ts`). Cada tool expone parámetros tipados con Zod; las queries se arman con el query builder de Supabase o funciones Postgres (`match_products`, `create_order`). Text-to-SQL libre contra la DB de producción es un vector de inyección y de fuga de datos entre usuarios.
- **`get_order_status` nunca debe tomar el `user_id` del input del modelo.** Siempre viene por closure de la sesión de servidor ya autenticada (`src/app/api/chat/route.ts`).
- Toda tabla nueva necesita RLS activo. No asumir que el guard en el código alcanza — verificar también con un usuario `customer` real contra la REST API.
- `/admin` se protege en dos capas: middleware (`src/proxy.ts`, exige sesión) + `requireAdmin()` en el layout de servidor (exige `profiles.role = 'admin'`). Las dos deben mantenerse si se agregan rutas admin nuevas.

## Convenciones

- Schemas Zod se comparten entre formulario, API route y `inputSchema` de las tools del chat (`src/lib/schemas/`) — no duplicar validación.
- Precios en **COP**, no USD/MXN.
- Al editar un producto desde el CMS, marcar `embedding_updated_at = null` para que quede pendiente de re-embeber (no recalcular el embedding de forma síncrona/bloqueante ahí).
- Las tools de búsqueda del chat reemplazan (no acumulan) el array `collected` de tarjetas de producto por request — si Claude encadena varias tool calls, las tarjetas deben reflejar la búsqueda más específica, no la unión de todas.
- Rutas de la tienda van en el route group `(shop)` (con header/footer propio); `/admin`, `/login` y `/registro` NO llevan ese layout.
