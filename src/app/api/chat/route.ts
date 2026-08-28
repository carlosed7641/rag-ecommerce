import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildChatTools, type ProductCard } from "@/lib/chat/tools";

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres el asistente de compras de RagTech, una tienda de electrónica en Colombia.

Reglas estrictas:
- Solo respondes preguntas relacionadas con el catálogo de la tienda, precios, disponibilidad y el estado de órdenes del usuario. Para cualquier otro tema (clima, noticias, opiniones generales, etc.) respondes que no tienes esa información porque solo puedes ayudar con temas de la tienda.
- Nunca inventas productos, precios, materiales ni stock. Toda esa información sale exclusivamente de las herramientas que tienes disponibles — si no las usaste, no afirmes datos concretos de productos.
- Si una pregunta tiene un filtro exacto (precio, categoría, material, disponibilidad), usa search_products_by_attributes. Si es una búsqueda por significado o descripción libre, usa search_products_semantic. Puedes combinarlas.
- Para el estado de una orden usa get_order_status. Si esa herramienta no está disponible, es porque no hay una sesión iniciada — dile al usuario que debe iniciar sesión para consultar sus órdenes.
- Responde siempre en español, en tono cercano y breve. Cuando menciones productos concretos, la interfaz ya muestra tarjetas con imagen y precio — no hace falta que describas cada dato en el texto, solo comenta lo relevante.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const { messages, sessionId }: { messages: ChatMessage[]; sessionId?: string } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Faltan mensajes." }), { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const collected: ProductCard[] = [];
  const tools = buildChatTools(user?.id ?? null, collected);

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  // Persistencia de turnos — best-effort, no bloquea la respuesta al usuario.
  // Usa el cliente admin porque un visitante anónimo (user_id null) no puede
  // pasar la política RLS "user_id = auth.uid()" (null no es igual a null en
  // SQL); igual es seguro porque el user_id que se graba sale exclusivamente
  // de la sesión ya validada arriba, nunca de lo que mande el cliente.
  const adminDb = createAdminClient();
  let currentSessionId = sessionId ?? null;
  async function ensureSession() {
    if (currentSessionId) return currentSessionId;
    const { data, error } = await adminDb
      .from("chat_sessions")
      .insert({ user_id: user?.id ?? null })
      .select("id")
      .single();
    if (error) console.error("[chat] no se pudo crear la sesión:", error);
    currentSessionId = data?.id ?? null;
    return currentSessionId;
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      }

      try {
        const sid = await ensureSession();
        if (sid && lastUserMessage) {
          await adminDb
            .from("chat_messages")
            .insert({ session_id: sid, role: "user", content: { text: lastUserMessage.content } });
        }

        const runner = anthropic.beta.messages.toolRunner({
          model: "claude-sonnet-5",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          tools,
        });

        let fullText = "";
        for await (const message of runner) {
          for (const block of message.content) {
            if (block.type === "text") {
              fullText += block.text;
              send("text", { delta: block.text });
            }
          }
        }

        const products = collected.slice(0, 6);
        send("products", { items: products });
        send("done", { sessionId: sid });

        if (sid) {
          await adminDb.from("chat_messages").insert({
            session_id: sid,
            role: "assistant",
            content: { text: fullText, products },
          });
        }
      } catch (err) {
        send("error", { message: err instanceof Error ? err.message : "Error desconocido." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
