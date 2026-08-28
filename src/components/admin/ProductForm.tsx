"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProductActionState } from "@/app/admin/productos/actions";
import type { Product, Category } from "@/lib/products";

type Action = (
  state: ProductActionState,
  formData: FormData,
) => Promise<ProductActionState>;

type PendingImage = { file: File; previewUrl: string };

// Quita tildes, pasa a minúsculas y convierte cualquier corrida de
// caracteres no válidos (empezando por los espacios) en un solo guion.
function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({
  action,
  categories,
  product,
}: {
  action: Action;
  categories: Category[];
  product?: Product & { categories?: { name: string; slug: string } | null };
}) {
  // Imágenes ya guardadas en Storage (o las que quedan tras "Guardar
  // cambios"). Las nuevas quedan aparte, solo como preview en memoria
  // (URL.createObjectURL) — no se suben a Storage hasta el submit.
  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? []);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputId = useId();

  // El slug se autocompleta a partir del nombre mientras se crea un producto
  // nuevo — deja de seguirlo apenas el admin toca el campo a mano, y nunca
  // lo hace al editar (no queremos romper un slug ya publicado solo porque
  // cambió el nombre).
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));

  // Para poder liberar los object URLs pendientes al desmontar sin volver a
  // registrar el cleanup en cada cambio de pendingImages.
  const pendingImagesRef = useRef(pendingImages);
  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);
  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPendingImages((prev) => [...prev, ...next]);
  }

  function removeExisting(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removePending(index: number) {
    setPendingImages((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  // Recién acá se suben de verdad a Storage — al hacer submit del form, no
  // al elegir el archivo. Si algo falla, no se guarda nada del producto.
  async function uploadThenSubmit(
    prevState: ProductActionState,
    formData: FormData,
  ): Promise<ProductActionState> {
    let finalImages = existingImages;

    if (pendingImages.length > 0) {
      setUploadError(null);
      const supabase = createClient();
      try {
        const uploaded: string[] = [];
        for (const { file } of pendingImages) {
          const ext = file.name.split(".").pop() || "jpg";
          const path = `${crypto.randomUUID()}.${ext}`;
          const { error } = await supabase.storage
            .from("product-images")
            .upload(path, file, { cacheControl: "3600", upsert: false });
          if (error) throw error;
          const { data } = supabase.storage.from("product-images").getPublicUrl(path);
          uploaded.push(data.publicUrl);
        }
        finalImages = [...existingImages, ...uploaded];
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudieron subir las imágenes.";
        setUploadError(message);
        return { error: message };
      }
    }

    formData.set("images", finalImages.join("\n"));
    return action(prevState, formData);
  }

  const [state, formAction, pending] = useActionState<
    ProductActionState,
    FormData
  >(uploadThenSubmit, null);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Nombre">
          <input
            name="name"
            value={name}
            onChange={(e) => {
              const value = e.target.value;
              setName(value);
              if (!slugTouched) setSlug(slugify(value));
            }}
            required
            className="input"
          />
        </Field>
        <Field label="Slug">
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Solo minúsculas, números y guiones"
            className="input"
          />
        </Field>
      </div>

      <Field label="Descripción">
        <textarea
          name="description"
          defaultValue={product?.description ?? ""}
          rows={4}
          className="input resize-none"
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Precio (COP)">
          <input
            name="price"
            type="number"
            min={0}
            step="1"
            defaultValue={product?.price}
            required
            className="input"
          />
        </Field>
        <Field label="Precio comparativo">
          <input
            name="compareAtPrice"
            type="number"
            min={0}
            step="1"
            defaultValue={product?.compare_at_price ?? ""}
            className="input"
          />
        </Field>
        <Field label="Stock">
          <input
            name="stock"
            type="number"
            min={0}
            step="1"
            defaultValue={product?.stock ?? 0}
            required
            className="input"
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Categoría">
          <select
            name="categoryId"
            defaultValue={product?.category_id ?? ""}
            required
            className="input"
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Material">
          <input
            name="material"
            defaultValue={product?.material ?? ""}
            className="input"
          />
        </Field>
      </div>

      <Field label="Tags (separados por coma)">
        <input
          name="tags"
          defaultValue={product?.tags?.join(", ") ?? ""}
          className="input"
        />
      </Field>

      {/* No usa <Field>: ese componente envuelve todo en un <label> sin
          htmlFor, y el navegador lo asocia implícitamente al primer elemento
          "labelable" que encuentre adentro. Acá eso era el botón "×" de la
          primera miniatura (no el input de archivo) — cualquier click en esta
          sección terminaba disparando ese botón y borrando la imagen. */}
      <div className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
          Imágenes
        </span>
        <div className="mb-3 flex flex-wrap gap-3">
          {existingImages.map((src, i) => (
            <div
              key={`existing-${src}`}
              className="group relative h-20 w-20 overflow-hidden rounded-lg border border-line"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeExisting(i)}
                className="absolute inset-0 flex items-center justify-center bg-ink/60 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                Quitar
              </button>
            </div>
          ))}
          {pendingImages.map((p, i) => (
            <div
              key={`pending-${p.previewUrl}`}
              className="group relative h-20 w-20 overflow-hidden rounded-lg border-2 border-dashed border-copper/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.previewUrl} alt="" className="h-full w-full object-cover" />
              <span className="absolute left-1 top-1 rounded-full bg-copper px-1.5 py-0.5 text-[10px] font-semibold text-white">
                Nueva
              </span>
              <button
                type="button"
                onClick={() => removePending(i)}
                className="absolute inset-0 flex items-center justify-center bg-ink/60 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
        <label
          htmlFor={fileInputId}
          className="inline-block rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink hover:border-copper hover:text-copper"
        >
          + Subir imágenes
        </label>
        <input
          id={fileInputId}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={pending}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="mt-2 text-xs text-muted">
          Las imágenes marcadas &quot;Nueva&quot; recién se suben al hacer clic en
          {product ? " Guardar cambios" : " Crear producto"}.
        </p>
        {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={product?.is_active ?? true}
          className="h-4 w-4 accent-copper"
        />
        Activo (visible en la tienda)
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-copper px-6 py-3 text-sm font-semibold text-white hover:bg-copper-ink disabled:opacity-60"
      >
        {pending
          ? pendingImages.length > 0
            ? "Subiendo imágenes…"
            : "Guardando…"
          : product
            ? "Guardar cambios"
            : "Crear producto"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
