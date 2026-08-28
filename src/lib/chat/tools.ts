import { z } from "zod";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { BetaRunnableTool } from "@anthropic-ai/sdk/lib/tools/BetaRunnableTool";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { embedQuery } from "@/lib/embeddings";

export type ProductCard = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
};

function toCard(p: {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
}): ProductCard {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compare_at_price,
    image: p.images?.[0] ?? null,
  };
}

/**
 * Arma las tools del chat para UNA request puntual. `collected` recibe (por
 * referencia, push) las tarjetas de producto que las tools de búsqueda vayan
 * encontrando, para que la ruta pueda mandarlas a la UI aparte del texto de
 * Claude — cada request tiene su propio array, nada se comparte entre
 * usuarios ni entre requests concurrentes.
 *
 * `userId` es siempre el de la sesión del servidor (o null si es anónimo):
 * get_order_status solo se agrega a la lista si hay sesión, y aunque se
 * agregara, ignora cualquier id que intente venir por otro lado — nunca
 * hay forma de que Claude pida la orden de otro usuario.
 */
export function buildChatTools(userId: string | null, collected: ProductCard[]) {
  const searchProductsByAttributes = betaZodTool({
    name: "search_products_by_attributes",
    description:
      "Busca productos del catálogo por filtros exactos: rango de precio, categoría, material y disponibilidad. " +
      "Úsala para preguntas con criterios numéricos o categóricos claros, como 'productos de menos de 150 mil pesos' " +
      "o 'audífonos disponibles en stock'. No sirve para búsquedas por significado o descripción libre.",
    inputSchema: z.object({
      maxPrice: z.number().optional().describe("Precio máximo en COP"),
      minPrice: z.number().optional().describe("Precio mínimo en COP"),
      category: z
        .string()
        .optional()
        .describe("Slug o nombre de la categoría, ej: 'audifonos', 'laptops'"),
      material: z.string().optional().describe("Material del producto, ej: 'plástico', 'aluminio'"),
      inStock: z.boolean().optional().describe("true para solo productos con stock disponible"),
      sortBy: z.enum(["precio_asc", "precio_desc", "recientes"]).optional(),
      limit: z.number().int().min(1).max(20).default(8),
    }),
    run: async (input) => {
      const supabase = await createClient();

      let query = supabase
        .from("products")
        .select(
          "id, name, slug, price, compare_at_price, description, material, images, stock, categories(name, slug)",
        )
        .eq("is_active", true);

      if (input.maxPrice !== undefined) query = query.lte("price", input.maxPrice);
      if (input.minPrice !== undefined) query = query.gte("price", input.minPrice);
      if (input.material) query = query.ilike("material", `%${input.material}%`);
      if (input.inStock) query = query.gt("stock", 0);
      if (input.category) {
        query = query.or(`slug.ilike.%${input.category}%,name.ilike.%${input.category}%`, {
          referencedTable: "categories",
        });
      }

      switch (input.sortBy) {
        case "precio_asc":
          query = query.order("price", { ascending: true });
          break;
        case "precio_desc":
          query = query.order("price", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query.limit(input.limit);
      if (error) return `Error consultando productos: ${error.message}`;
      if (!data || data.length === 0) return "No se encontraron productos con esos filtros.";

      // Reemplaza (no acumula) lo recolectado: si Claude encadena varias
      // tools en el mismo turno, las tarjetas deben reflejar la búsqueda más
      // específica —normalmente la última—, no la unión de todas. Si no,
      // resultados de un filtro genérico anterior (ej. precio sin categoría)
      // se cuelan antes que los realmente relevantes.
      collected.length = 0;
      data.forEach((p) => collected.push(toCard(p)));

      return JSON.stringify(
        data.map((p) => ({
          nombre: p.name,
          precio: p.price,
          precio_comparativo: p.compare_at_price,
          material: p.material,
          stock: p.stock,
          categoria: p.categories?.name ?? null,
          slug: p.slug,
        })),
      );
    },
  });

  const searchProductsSemantic = betaZodTool({
    name: "search_products_semantic",
    description:
      "Busca productos por significado o descripción libre usando similitud semántica, ej: 'algo cómodo para hacer ejercicio' " +
      "o 'un regalo tecnológico económico'. Combínala con search_products_by_attributes cuando la pregunta también tenga un filtro numérico, " +
      "ej: 'algo de algodón por menos de 20 mil'.",
    inputSchema: z.object({
      query: z.string().min(2).describe("Descripción en lenguaje natural de lo que busca el usuario"),
      maxPrice: z.number().optional(),
      minPrice: z.number().optional(),
      limit: z.number().int().min(1).max(20).default(6),
    }),
    run: async (input) => {
      let embedding;
      try {
        embedding = await embedQuery(input.query);
      } catch (err) {
        return `Error generando la búsqueda semántica: ${err instanceof Error ? err.message : "desconocido"}`;
      }

      const supabase = await createClient();
      const { data, error } = await supabase.rpc("match_products", {
        query_embedding: embedding as unknown as string,
        match_count: input.limit,
        filter_max_price: input.maxPrice,
        filter_min_price: input.minPrice,
      });

      if (error) return `Error en la búsqueda semántica: ${error.message}`;
      if (!data || data.length === 0) return "No se encontraron productos similares a esa descripción.";

      collected.length = 0;
      data.forEach((p) => collected.push(toCard(p)));

      return JSON.stringify(
        data.map((p) => ({
          nombre: p.name,
          precio: p.price,
          precio_comparativo: p.compare_at_price,
          material: p.material,
          stock: p.stock,
          similitud: Math.round(p.similarity * 100) / 100,
          slug: p.slug,
        })),
      );
    },
  });

  const getOrderStatus = betaZodTool({
    name: "get_order_status",
    description:
      "Consulta el estado de una orden del usuario que está hablando en el chat, dado su número de orden. " +
      "Solo puede ver órdenes que pertenecen a la cuenta con la sesión iniciada.",
    inputSchema: z.object({
      orderId: z.string().describe("El id (UUID) de la orden a consultar"),
    }),
    run: async (input) => {
      // userId viene del cierre (la sesión del servidor), nunca del input de
      // la tool — así no hay forma de pedir la orden de otra cuenta.
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total, created_at, order_items(product_name, quantity, unit_price)")
        .eq("id", input.orderId)
        .eq("user_id", userId!)
        .maybeSingle();

      if (error) return `Error consultando la orden: ${error.message}`;
      if (!data) return "No se encontró esa orden asociada a tu cuenta.";

      return JSON.stringify({
        estado: data.status,
        total: data.total,
        fecha: data.created_at,
        items: data.order_items,
      });
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- las 3 tools tienen inputSchema distinto; el SDK las tipa por unión heterogénea igual
  const tools: BetaRunnableTool<any>[] = [searchProductsByAttributes, searchProductsSemantic];
  if (userId) tools.push(getOrderStatus);
  return tools;
}
