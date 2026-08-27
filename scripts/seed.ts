/**
 * Siembra categorías y productos de prueba para RagTech.
 * Idempotente: usa upsert por `slug`, así que correrlo varias veces no duplica nada.
 * Precios en pesos colombianos (COP), aproximados (tasa de referencia ~220 COP/MXN).
 *
 * Uso: npm run seed
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
import type { Database } from "../src/lib/supabase/database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local",
  );
  process.exit(1);
}

const supabase = createClient<Database>(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function picsum(slug: string, w = 640, h = 480): string {
  return `https://picsum.photos/seed/${slug}/${w}/${h}`;
}

// Tasa de referencia aproximada MXN → COP. Los precios fuente se mantienen en
// MXN (más fáciles de leer/ajustar) y se convierten aquí al sembrar.
const MXN_TO_COP = 220;
function toCop(mxn: number): number {
  return Math.round((mxn * MXN_TO_COP) / 1000) * 1000;
}

const categories = [
  { name: "Audio", slug: "audio" },
  { name: "Cómputo", slug: "computo" },
  { name: "Hogar inteligente", slug: "hogar-inteligente" },
  { name: "Accesorios", slug: "accesorios" },
  { name: "Gaming", slug: "gaming" },
  { name: "Fotografía", slug: "fotografia" },
] as const;

type CategorySlug = (typeof categories)[number]["slug"];

type SeedProduct = {
  name: string;
  category: CategorySlug;
  description: string;
  priceMXN: number;
  compareAtPriceMXN?: number;
  material: string;
  tags: string[];
  stock: number;
  isActive?: boolean;
};

const products: SeedProduct[] = [
  // --- Audio ---
  {
    name: "RagTech Aria",
    category: "audio",
    description:
      "Auriculares inalámbricos con cancelación de ruido híbrida y 40 horas de batería con estuche.",
    priceMXN: 1499,
    compareAtPriceMXN: 1799,
    material: "aluminio y silicona",
    tags: ["inalámbrico", "cancelación de ruido", "recargable"],
    stock: 42,
  },
  {
    name: "RagTech Aria Mini",
    category: "audio",
    description: "Earbuds compactos resistentes al agua, ideales para deporte.",
    priceMXN: 899,
    material: "silicona",
    tags: ["inalámbrico", "resistente al agua", "deporte"],
    stock: 60,
  },
  {
    name: "RagTech Boom 20",
    category: "audio",
    description: "Bocina bluetooth portátil con 12 horas de batería.",
    priceMXN: 649,
    material: "plástico ABS",
    tags: ["bluetooth", "resistente al agua", "portátil"],
    stock: 35,
  },
  {
    name: "RagTech Boom 40",
    category: "audio",
    description: "Bocina bluetooth de mayor potencia con graves profundos.",
    priceMXN: 1299,
    material: "aluminio",
    tags: ["bluetooth", "graves profundos"],
    stock: 20,
  },
  {
    name: "RagTech Wave Pro",
    category: "audio",
    description: "Audífonos over-ear de estudio para monitoreo de alta fidelidad.",
    priceMXN: 2199,
    material: "cuero sintético y aluminio",
    tags: ["cableado", "alta fidelidad", "estudio"],
    stock: 0,
  },
  {
    name: "RagTech Clip Mic",
    category: "audio",
    description: "Micrófono de solapa inalámbrico para streaming y video.",
    priceMXN: 799,
    material: "plástico ABS",
    tags: ["inalámbrico", "streaming"],
    stock: 28,
  },
  {
    name: "RagTech SoundBar S1",
    category: "audio",
    description: "Barra de sonido compacta para home theater con entrada HDMI.",
    priceMXN: 3499,
    material: "aluminio",
    tags: ["hdmi", "home theater"],
    stock: 0,
  },

  // --- Cómputo ---
  {
    name: "RagTech Type-60",
    category: "computo",
    description: "Teclado mecánico 60% hotswap, retroiluminado, cuerpo de aluminio.",
    priceMXN: 2199,
    material: "aluminio y policarbonato",
    tags: ["mecánico", "retroiluminado", "hotswap"],
    stock: 18,
  },
  {
    name: "RagTech Type-TKL",
    category: "computo",
    description: "Teclado mecánico tamaño TKL, inalámbrico, cuerpo de aluminio.",
    priceMXN: 2599,
    material: "aluminio",
    tags: ["mecánico", "inalámbrico"],
    stock: 15,
  },
  {
    name: "RagTech Glide",
    category: "computo",
    description: "Mouse inalámbrico ergonómico para uso prolongado.",
    priceMXN: 599,
    material: "plástico ABS",
    tags: ["inalámbrico", "ergonómico"],
    stock: 50,
  },
  {
    name: "RagTech Glide Pro",
    category: "computo",
    description: "Mouse gamer de alta precisión con iluminación RGB.",
    priceMXN: 899,
    material: "plástico ABS y goma",
    tags: ["rgb", "alta precisión", "gamer"],
    stock: 33,
  },
  {
    name: "RagTech Dock 7-in-1",
    category: "computo",
    description: "Hub USB-C con salida HDMI, lector SD y 3 puertos USB.",
    priceMXN: 899,
    material: "aluminio",
    tags: ["usb-c", "hdmi", "lector sd"],
    stock: 40,
  },
  {
    name: "RagTech Stand Air",
    category: "computo",
    description: "Soporte plegable para laptop con ventilación pasiva.",
    priceMXN: 549,
    material: "aluminio",
    tags: ["plegable", "ventilación"],
    stock: 45,
  },
  {
    name: "RagTech Cam HD",
    category: "computo",
    description: "Webcam 1080p con autoenfoque y micrófono integrado.",
    priceMXN: 749,
    material: "plástico ABS y vidrio",
    tags: ["autoenfoque", "micrófono integrado"],
    stock: 25,
  },

  // --- Hogar inteligente ---
  {
    name: "RagTech Plug",
    category: "hogar-inteligente",
    description: "Enchufe inteligente wifi con control remoto por app.",
    priceMXN: 349,
    material: "policarbonato",
    tags: ["wifi", "control remoto"],
    stock: 70,
  },
  {
    name: "RagTech Plug Duo",
    category: "hogar-inteligente",
    description: "Enchufe inteligente de doble salida con medición de consumo.",
    priceMXN: 549,
    material: "policarbonato",
    tags: ["wifi", "medición de consumo"],
    stock: 38,
  },
  {
    name: "RagTech Bulb Color",
    category: "hogar-inteligente",
    description: "Foco inteligente RGB con 16 millones de colores.",
    priceMXN: 299,
    material: "vidrio y plástico",
    tags: ["wifi", "16 millones de colores"],
    stock: 55,
  },
  {
    name: "RagTech Cam Home",
    category: "hogar-inteligente",
    description: "Cámara de seguridad wifi con visión nocturna y detección de movimiento.",
    priceMXN: 999,
    compareAtPriceMXN: 1199,
    material: "plástico ABS",
    tags: ["visión nocturna", "detección de movimiento"],
    stock: 22,
  },
  {
    name: "RagTech Sensor Door",
    category: "hogar-inteligente",
    description: "Sensor de puerta/ventana con alertas push a tu teléfono.",
    priceMXN: 249,
    material: "plástico ABS",
    tags: ["batería", "alertas push"],
    stock: 65,
  },
  {
    name: "RagTech Hub Central",
    category: "hogar-inteligente",
    description: "Hub de automatización compatible con Zigbee y wifi.",
    priceMXN: 1199,
    material: "plástico ABS y aluminio",
    tags: ["zigbee", "wifi"],
    stock: 12,
  },
  {
    name: "RagTech Thermo",
    category: "hogar-inteligente",
    description: "Termostato inteligente con reportes de ahorro de energía.",
    priceMXN: 1799,
    material: "plástico ABS y acero inoxidable",
    tags: ["wifi", "ahorro de energía"],
    stock: 0,
  },

  // --- Accesorios ---
  {
    name: "RagTech Cell 10K",
    category: "accesorios",
    description: "Power bank de 10,000 mAh con carga rápida USB-C.",
    priceMXN: 599,
    material: "policarbonato",
    tags: ["carga rápida", "usb-c"],
    stock: 80,
  },
  {
    name: "RagTech Cell 20K",
    category: "accesorios",
    description: "Power bank de 20,000 mAh con dos puertos de salida.",
    priceMXN: 899,
    material: "policarbonato",
    tags: ["carga rápida", "dos puertos"],
    stock: 48,
  },
  {
    name: "RagTech Cable Braid",
    category: "accesorios",
    description: "Cable USB-C trenzado de 1 metro, resistente a dobleces.",
    priceMXN: 199,
    material: "algodón trenzado y nylon",
    tags: ["trenzado", "resistente"],
    stock: 90,
  },
  {
    name: "RagTech Cable Braid 2m",
    category: "accesorios",
    description: "Cable USB-C trenzado de 2 metros, resistente a dobleces.",
    priceMXN: 249,
    material: "algodón trenzado y nylon",
    tags: ["trenzado", "resistente"],
    stock: 30,
    isActive: false, // descontinuado — para probar filtro is_active en el CMS
  },
  {
    name: "RagTech Charger 30W",
    category: "accesorios",
    description: "Cargador GaN de 30W, compacto para viaje diario.",
    priceMXN: 449,
    material: "policarbonato",
    tags: ["carga rápida", "compacto"],
    stock: 55,
  },
  {
    name: "RagTech Charger 65W",
    category: "accesorios",
    description: "Cargador GaN de 65W con doble puerto, para laptop y celular a la vez.",
    priceMXN: 749,
    material: "policarbonato",
    tags: ["carga rápida", "viaje"],
    stock: 26,
  },
  {
    name: "RagTech Mount Mag",
    category: "accesorios",
    description: "Soporte magnético para celular, compatible con carga MagSafe.",
    priceMXN: 299,
    material: "aluminio y silicona",
    tags: ["magnético", "compatible magsafe"],
    stock: 40,
  },
  {
    name: "RagTech Case Shield",
    category: "accesorios",
    description: "Funda protectora antigolpes con parte trasera transparente.",
    priceMXN: 349,
    material: "silicona y policarbonato",
    tags: ["antigolpes", "transparente"],
    stock: 60,
  },

  // --- Gaming ---
  {
    name: "RagTech Pad X",
    category: "gaming",
    description: "Control inalámbrico para PC y consola con vibración háptica.",
    priceMXN: 899,
    material: "plástico ABS y goma",
    tags: ["inalámbrico", "vibración háptica"],
    stock: 34,
  },
  {
    name: "RagTech Deck 15",
    category: "gaming",
    description: "Mousepad extendido con iluminación RGB y base antideslizante.",
    priceMXN: 449,
    material: "tela y goma",
    tags: ["rgb", "antideslizante"],
    stock: 44,
  },
  {
    name: "RagTech Headset G1",
    category: "gaming",
    description: "Audífonos gamer con sonido envolvente y micrófono desmontable.",
    priceMXN: 1099,
    material: "plástico ABS y espuma viscoelástica",
    tags: ["sonido envolvente", "micrófono desmontable"],
    stock: 21,
  },
  {
    name: "RagTech Stream Light",
    category: "gaming",
    description: "Luz LED regulable para streaming con temperatura de color ajustable.",
    priceMXN: 649,
    material: "aluminio y plástico",
    tags: ["regulable", "temperatura de color ajustable"],
    stock: 19,
  },
  {
    name: "RagTech Capture 4K",
    category: "gaming",
    description: "Capturadora de video 4K de baja latencia para streaming.",
    priceMXN: 1899,
    compareAtPriceMXN: 2199,
    material: "aluminio",
    tags: ["usb-c", "baja latencia"],
    stock: 10,
  },
  {
    name: "RagTech Chair Support",
    category: "gaming",
    description: "Cojín ergonómico de espuma viscoelástica para silla gamer.",
    priceMXN: 599,
    material: "espuma viscoelástica y tela",
    tags: ["ergonómico", "transpirable"],
    stock: 37,
  },

  // --- Fotografía ---
  {
    name: "RagTech Tripod Flex",
    category: "fotografia",
    description: "Tripié flexible con patas de silicona, se adapta a cualquier superficie.",
    priceMXN: 399,
    material: "aluminio y silicona",
    tags: ["flexible", "portátil"],
    stock: 50,
  },
  {
    name: "RagTech Gimbal S",
    category: "fotografia",
    description: "Estabilizador de 3 ejes para celular con control bluetooth.",
    priceMXN: 1599,
    material: "aluminio y plástico ABS",
    tags: ["3 ejes", "bluetooth"],
    stock: 14,
  },
  {
    name: "RagTech Ring Light 10",
    category: "fotografia",
    description: "Aro de luz de 10 pulgadas regulable, con soporte para celular.",
    priceMXN: 549,
    material: "plástico ABS",
    tags: ["regulable", "con soporte para celular"],
    stock: 29,
  },
  {
    name: "RagTech Lens Wide",
    category: "fotografia",
    description: "Lente gran angular de clip universal para celular.",
    priceMXN: 449,
    material: "vidrio óptico y aluminio",
    tags: ["clip universal", "gran angular"],
    stock: 32,
  },
  {
    name: "RagTech Mic Shotgun",
    category: "fotografia",
    description: "Micrófono direccional para cámara, reduce ruido de fondo.",
    priceMXN: 899,
    material: "aluminio y espuma",
    tags: ["direccional", "reduce ruido de fondo"],
    stock: 17,
  },
  {
    name: "RagTech Card 256",
    category: "fotografia",
    description: "Tarjeta microSD de 256GB de alta velocidad para cámaras y drones.",
    priceMXN: 449,
    material: "policarbonato",
    tags: ["alta velocidad", "para cámaras y drones"],
    stock: 24,
    isActive: false, // reemplazada por el modelo 512GB — para probar filtro is_active
  },
];

async function main() {
  console.log(`Sembrando ${categories.length} categorías...`);
  const { data: insertedCategories, error: catError } = await supabase
    .from("categories")
    .upsert(
      categories.map((c) => ({ name: c.name, slug: c.slug })),
      { onConflict: "slug" },
    )
    .select("id, slug");

  if (catError) throw catError;

  const categoryIdBySlug = new Map(
    insertedCategories!.map((c) => [c.slug, c.id]),
  );

  console.log(`Sembrando ${products.length} productos...`);
  const rows = products.map((p) => {
    const slug = slugify(p.name);
    return {
      name: p.name,
      slug,
      description: p.description,
      price: toCop(p.priceMXN),
      compare_at_price: p.compareAtPriceMXN ? toCop(p.compareAtPriceMXN) : null,
      category_id: categoryIdBySlug.get(p.category) ?? null,
      material: p.material,
      tags: p.tags,
      images: [picsum(slug)],
      stock: p.stock,
      is_active: p.isActive ?? true,
    };
  });

  const { error: prodError } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "slug" });

  if (prodError) throw prodError;

  console.log("Listo. Catálogo sembrado en Supabase.");
}

main().catch((err) => {
  console.error("Error al sembrar:", err);
  process.exit(1);
});
