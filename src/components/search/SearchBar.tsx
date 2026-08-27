"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";

type QuickResult = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
};

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QuickResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce: espera 250ms de silencio antes de consultar la API.
  // Con menos de 2 caracteres simplemente no se dispara el fetch (shownResults
  // ya cae a [] más abajo, sin necesidad de un setState síncrono aquí).
  useEffect(() => {
    if (query.trim().length < 2) return;

    let ignore = false;
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search/quick?q=${encodeURIComponent(query)}`);
      if (ignore || !res.ok) return;
      const data = await res.json();
      if (ignore) return;
      setResults(data.results ?? []);
      setOpen(true);
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(timeout);
    };
  }, [query]);

  const shownResults = query.trim().length < 2 ? [] : results;

  // Cierra el dropdown al hacer clic fuera.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToResultsPage() {
    if (query.trim().length === 0) return;
    setOpen(false);
    router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-[28rem]">
      <label className="flex items-center gap-2.5 rounded-[3px] border border-line-strong bg-surface px-3.5 py-2.5 transition-colors focus-within:border-copper">
        <span className="font-mono text-sm text-copper">&gt;</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => shownResults.length > 0 && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") goToResultsPage();
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Buscar por nombre, categoría o material…"
          aria-label="Buscar productos"
          className="flex-1 bg-transparent font-mono text-[0.88rem] text-ink outline-none placeholder:text-muted"
        />
      </label>

      {open && shownResults.length > 0 && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded border border-line-strong bg-surface shadow-lg">
          <div className="flex items-center gap-1.5 px-3.5 pb-1.5 pt-2.5 font-mono text-[0.65rem] uppercase tracking-wider text-signal">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
            En vivo mientras escribes
          </div>
          {shownResults.map((r) => (
            <Link
              key={r.id}
              href={`/productos/${r.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-sm text-ink hover:bg-bg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.images[0]}
                alt=""
                className="h-8 w-8 flex-none rounded-sm border border-line object-cover"
              />
              <span className="flex-1">{r.name}</span>
              <span className="font-mono text-xs text-muted">
                {formatCurrency(r.price)}
              </span>
            </Link>
          ))}
          <button
            onClick={goToResultsPage}
            className="block w-full border-t border-line px-3.5 py-2.5 text-left font-mono text-xs text-copper hover:bg-bg"
          >
            Ver todos los resultados para &ldquo;{query}&rdquo; →{" "}
            <span className="float-right text-muted">Enter ⏎</span>
          </button>
        </div>
      )}
    </div>
  );
}
