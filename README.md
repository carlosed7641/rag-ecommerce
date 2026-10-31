# RagTech — Ecommerce + Chat con RAG / Text-to-Attributes

Ecommerce full-stack (storefront + CMS admin) con un asistente de compras conversacional que combina **búsqueda semántica (RAG con embeddings)** y **filtros estructurados** sobre el mismo catálogo, usando tool calling de Claude en lugar de un pipeline RAG clásico o text-to-SQL libre.

Construido con Next.js 16 (App Router), Supabase (Postgres + pgvector + Auth + Storage) y el SDK de Anthropic.

**Demo:** https://rag-ecommerce-gilt.vercel.app

## Índice

- [Por qué esta arquitectura](#por-qué-esta-arquitectura)
- [Stack](#stack)
- [Estructura del proyecto](#estructura-del-proyecto)
- [El chat: cómo funciona](#el-chat-cómo-funciona)
- [Modelo de datos](#modelo-de-datos)
- [Seguridad](#seguridad)
- [Puesta en marcha](#puesta-en-marcha)
- [Scripts](#scripts)
- [Rutas principales](#rutas-principales)

## Por qué esta arquitectura

El chat necesita responder dos clases de pregunta muy distintas:

- **"productos menores a 150.000 pesos"** → no es una tarea de RAG. Es un filtro numérico/categórico exacto. Un vector store no representa bien el orden numérico, así que esto se resuelve con una consulta a la base de datos con parámetros tipados.
- **"algo cómodo para hacer ejercicio" / "productos de algodón"** → sí es búsqueda semántica sobre las descripciones, resuelta con embeddings + similitud coseno (pgvector).

Por eso el chat **no** usa un pipeline RAG clásico (embed → retrieve → stuff prompt) ni text-to-SQL con SQL libre. Usa **tool calling**: se le dan a Claude tres herramientas y el propio modelo decide cuál usar (o combinarlas) según la pregunta.

**Regla de seguridad central:** Claude nunca escribe SQL. Cada tool expone parámetros tipados (`maxPrice`, `category`, `inStock`, etc., validados con Zod) y es el servidor quien arma la consulta contra Supabase. Esto elimina el vector de inyección SQL y de fuga de datos entre usuarios que tendría un text-to-SQL con SQL libre contra la base de producción.

## Stack

| Capa | Elección |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript + Tailwind v4 |
| Base de datos | Supabase Postgres + extensión `pgvector` |
| Auth | Supabase Auth (email/password), rol en `profiles.role` |
| Storage | Supabase Storage (bucket `product-images`) |
| Estado del carrito | Zustand + persistencia en `localStorage` |
| LLM | Anthropic SDK (`@anthropic-ai/sdk`), `claude-sonnet-5` vía `beta.messages.toolRunner` |
| Embeddings | Voyage AI (`voyage-3.5`, 1024 dims) — Anthropic no tiene endpoint de embeddings propio |
| Validación | Zod, compartido entre formularios, API routes y los `inputSchema` de las tools del chat |
| Deploy sugerido | Vercel + Supabase Cloud |

## Estructura del proyecto

```
src/app/(shop)/            Storefront público: home, catálogo, producto, carrito,
                            checkout, cuenta, búsqueda
src/app/(auth)/             Login / registro (layout propio, sin header de tienda)
src/app/admin/               CMS: dashboard, productos, categorías, órdenes,
                            cupones, usuarios (protegido por rol)
src/app/api/chat/route.ts  Endpoint del chat (streaming SSE)
src/app/api/embeddings/sync/  Recalcula embeddings pendientes (solo admin)
src/app/api/search/quick/  Búsqueda rápida (texto, ilike) para el header

src/lib/chat/tools.ts      Las 3 tools que usa el chat
src/lib/embeddings.ts      Cliente de Voyage AI (embed de documentos y de queries)
src/lib/supabase/          Clientes client / server / admin (@supabase/ssr)
src/lib/schemas/product.ts Schemas Zod compartidos (form, API, tools)
src/lib/admin.ts           requireAdmin() — guard de rol para el CMS
src/lib/products.ts        Queries de catálogo (server)
src/lib/orders.ts          Queries de órdenes (server)

src/components/chat/ChatWidget.tsx  Burbuja flotante del chat (streaming + tarjetas)
src/components/product/, search/, checkout/, orders/, account/, admin/, layout/

src/store/cart.ts          Carrito (Zustand)
src/proxy.ts               Middleware: refresca sesión y protege rutas privadas

scripts/seed.ts                 Seed idempotente del catálogo (~40 productos)
scripts/backfill-embeddings.ts  Genera embeddings para todo el catálogo existente
```

## El chat: cómo funciona

**Endpoint:** `src/app/api/chat/route.ts`

1. Resuelve la sesión del usuario (o `null` si es anónimo) con el cliente Supabase de servidor.
2. Arma la lista de tools **por request** con `buildChatTools(userId, collected)` — nada se comparte entre usuarios ni entre requests concurrentes.
3. Llama a `anthropic.beta.messages.toolRunner({ model: "claude-sonnet-5", tools, ... })`, que ejecuta el loop de tool calling automáticamente.
4. Emite la respuesta como **Server-Sent Events** (`event: text | products | done | error`) para que la UI la vaya mostrando en streaming.
5. Persiste los turnos en `chat_sessions` / `chat_messages` con el cliente admin (best-effort, no bloquea la respuesta).

**Las tres tools (`src/lib/chat/tools.ts`)**, definidas con `betaZodTool`:

1. **`search_products_by_attributes`** — filtros exactos (precio, categoría, material, stock, orden) armados con el query builder de Supabase. Para preguntas del tipo "audífonos disponibles bajo 150 mil".
2. **`search_products_semantic`** — embebe la pregunta del usuario (Voyage AI, `input_type: query`) y llama a la función SQL `match_products` (búsqueda por similitud coseno sobre `products.embedding` con índice HNSW). También acepta `minPrice`/`maxPrice`, así puede resolver sola preguntas mixtas como "algo de algodón por menos de 20 mil".
3. **`get_order_status`** — el `user_id` viene cerrado por closure desde la sesión validada del servidor, **nunca** del input del modelo; siempre filtra `orders` por ese id. Solo se agrega a la lista de tools si hay sesión iniciada.

**Indexado de productos (`src/lib/embeddings.ts`):**

- El texto embebido por producto combina nombre + descripción + material + categoría + tags.
- `syncPendingEmbeddings()` recalcula todo lo que tenga `embedding_updated_at = null`; se dispara fire-and-forget al crear/editar un producto en el CMS y también vía `/api/embeddings/sync` (admin).
- `scripts/backfill-embeddings.ts` recalcula el catálogo completo (útil tras el seed inicial o una migración).

**UI (`src/components/chat/ChatWidget.tsx`):** burbuja flotante montada solo en el storefront `(shop)`, con streaming de texto y tarjetas de producto (imagen + precio, enlazadas a `/productos/[slug]`) debajo de la respuesta cuando alguna tool encontró resultados.

## Modelo de datos

Tablas principales en Postgres (Supabase), con RLS activo en todas:

```
profiles        id (fk auth.users), full_name, role ('customer' | 'admin')
categories      id, name, slug, parent_id
products        id, name, slug, description, price, compare_at_price,
                category_id, material, tags[], images[], stock, is_active,
                embedding vector(1024), embedding_updated_at
addresses       id, user_id, line1, city, state, zip, country, is_default
carts / cart_items
orders          id, user_id, status, subtotal, discount, total,
                shipping_address jsonb
order_items     id, order_id, product_id, product_name, quantity, unit_price
coupons         code, type ('percent' | 'fixed'), value, min_subtotal,
                max_uses, used_count, expires_at, is_active
chat_sessions   id, user_id nullable
chat_messages   id, session_id, role, content jsonb
```

Puntos clave:

- `products.embedding` con índice **HNSW** (`vector_cosine_ops`) + función SQL `match_products(...)` para la búsqueda semántica.
- Índices en `products(price)`, `products(category_id)`, `products(is_active)` para los filtros del chat y del catálogo.
- El checkout descuenta stock dentro de una función Postgres transaccional (`create_order(...)`) que valida stock, aplica cupón e inserta orden + items de forma atómica — evita sobreventa por pasos separados desde el cliente.

## Seguridad

- **Sin SQL libre generado por el modelo.** Las tools exponen parámetros tipados con Zod; el servidor construye la query.
- **`get_order_status` nunca confía en el input del modelo** para el `user_id` — lo toma por closure de la sesión ya autenticada.
- **RLS en todas las tablas**: productos/categorías legibles públicamente si `is_active`; escritura solo con `profiles.role = 'admin'`; órdenes y direcciones visibles solo por su dueño.
- **`/admin` protegido en dos capas**: el middleware (`src/proxy.ts`) exige sesión, y `requireAdmin()` en el layout de servidor exige además rol `admin` (verificado también con RLS, no solo con la UI).
- El chat rechaza explícitamente temas ajenos a la tienda y nunca inventa productos, precios o stock — toda esa información sale exclusivamente de las tools.

## Puesta en marcha

Requisitos: Node 20+, una cuenta de [Supabase](https://supabase.com), una API key de [Anthropic](https://console.anthropic.com) y una de [Voyage AI](https://dash.voyageai.com) (200M tokens gratis).

```bash
npm install
cp .env.example .env.local   # completar con tus credenciales
```

Variables de entorno (`.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
ANTHROPIC_API_KEY=
VOYAGE_API_KEY=
```

Con el esquema ya aplicado en tu proyecto de Supabase (extensión `vector`, tablas, índice HNSW, función `match_products` y RLS):

```bash
npm run seed                  # catálogo de prueba (~40 productos)
npm run backfill-embeddings   # genera embeddings para todo el catálogo
npm run dev                   # http://localhost:3000
```

Para usar el CMS, promové tu usuario a `admin` (`profiles.role = 'admin'`) desde Supabase y entrá a `/admin`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` / `npm run start` | Build y servidor de producción |
| `npm run lint` | ESLint |
| `npm run seed` | Puebla el catálogo (idempotente, upsert por slug) |
| `npm run backfill-embeddings` | Recalcula embeddings de todo el catálogo |

## Rutas principales

| Ruta | Descripción |
|---|---|
| `/` | Home: destacados, recién llegados, más vendidos |
| `/productos` | Catálogo con filtros (categoría, precio, orden) y paginación |
| `/productos/[slug]` | Detalle de producto |
| `/carrito`, `/checkout` | Carrito y checkout simulado (orden real en DB, sin pagos reales) |
| `/cuenta` | Perfil, direcciones, historial de órdenes |
| `/buscar` | Resultados de búsqueda de texto completa |
| `/admin` | Dashboard, productos, categorías, órdenes, cupones, usuarios |

---

Proyecto de práctica/curso. Ver `PLAN.md` para el historial detallado de decisiones, bugs corregidos y verificaciones hechas durante el desarrollo.
