"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { ProductCard } from "@/lib/chat/tools";

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: ProductCard[];
};

const WELCOME: Message = {
  role: "assistant",
  content:
    "¡Hola! Soy el asistente de RagTech. Puedo ayudarte a encontrar productos del catálogo o revisar el estado de tus órdenes. ¿Qué buscas?",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const sessionIdRef = useRef<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setPending(true);

    // Índice del turno del asistente que se va a ir completando con el stream.
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          sessionId: sessionIdRef.current,
        }),
      });

      if (!res.body) throw new Error("Sin respuesta del servidor.");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const raw of events) {
          const lines = raw.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event: "));
          const dataLine = lines.find((l) => l.startsWith("data: "));
          if (!eventLine || !dataLine) continue;

          const eventName = eventLine.slice("event: ".length);
          const data = JSON.parse(dataLine.slice("data: ".length));

          if (eventName === "text") {
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              copy[copy.length - 1] = { ...last, content: last.content + data.delta };
              return copy;
            });
          } else if (eventName === "products") {
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              copy[copy.length - 1] = { ...last, products: data.items };
              return copy;
            });
          } else if (eventName === "done") {
            sessionIdRef.current = data.sessionId ?? sessionIdRef.current;
          } else if (eventName === "error") {
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = {
                role: "assistant",
                content: `Ocurrió un error: ${data.message}`,
              };
              return copy;
            });
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "No pude conectarme. Intenta de nuevo en un momento.",
        };
        return copy;
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[32rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-line bg-bg shadow-2xl sm:w-96">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Asistente RagTech</p>
              <p className="text-xs text-muted">Pregunta por productos o tus órdenes</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-ink"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-3.5 py-2 text-sm text-white"
                      : "max-w-[85%] rounded-2xl rounded-bl-sm bg-surface px-3.5 py-2 text-sm text-ink"
                  }
                >
                  {m.content ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    pending && i === messages.length - 1 && <TypingDots />
                  )}

                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 grid gap-2">
                      {m.products.map((p) => (
                        <Link
                          key={p.id}
                          href={`/productos/${p.slug}`}
                          className="flex items-center gap-3 rounded-xl border border-line bg-bg p-2 hover:border-copper"
                        >
                          <div className="h-12 w-12 flex-none overflow-hidden rounded-lg bg-surface">
                            {p.image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.image} alt="" className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-ink">{p.name}</p>
                            <p className="text-xs font-semibold text-copper">
                              {formatCurrency(p.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-line p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={pending}
              className="input flex-1"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="flex-none rounded-full bg-copper px-4 py-2 text-sm font-semibold text-white hover:bg-copper-ink disabled:opacity-50"
            >
              Enviar
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-xl hover:bg-copper"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
    </span>
  );
}
