import { z } from "zod";

/**
 * Schema compartido: form del CMS, validación de la server action y
 * (en la Fase 4) el input schema de la tool del chat.
 */
export const productSchema = z.object({
  name: z.string().min(2, "Ingresa un nombre"),
  slug: z
    .string()
    .min(2, "Ingresa un slug")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  categoryId: z.uuid("Selecciona una categoría").nullable(),
  material: z.string().optional(),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  isActive: z.boolean().default(true),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Ingresa un nombre"),
  slug: z
    .string()
    .min(2, "Ingresa un slug")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones"),
  parentId: z.uuid().nullable(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .transform((v) => v.toUpperCase()),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().positive("Debe ser mayor a 0"),
  minSubtotal: z.coerce.number().min(0).default(0),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});
export type CouponInput = z.infer<typeof couponSchema>;
