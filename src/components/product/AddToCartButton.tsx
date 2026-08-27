"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/lib/products";

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? null,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  if (outOfStock) {
    return (
      <button
        disabled
        className="w-full rounded-full bg-surface px-6 py-3 text-sm font-semibold text-muted"
      >
        Agotado
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-full border border-line-strong">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3.5 py-2 text-sm text-ink hover:text-copper"
          aria-label="Reducir cantidad"
        >
          −
        </button>
        <span className="min-w-[2ch] text-center text-sm text-ink">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
          className="px-3.5 py-2 text-sm text-ink hover:text-copper"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="flex-1 rounded-full bg-copper px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-copper-ink"
      >
        {added ? "Añadido ✓" : "Añadir al carrito"}
      </button>
    </div>
  );
}
