import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Búsqueda rápida para el dropdown del header. Texto simple (ilike sobre
 * nombre/material), no semántica — la búsqueda por embeddings es del chat
 * (Fase 4), un caso de uso distinto.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, price, images")
    .or(`name.ilike.%${q}%,material.ilike.%${q}%`)
    .order("name")
    .limit(6);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: data });
}
