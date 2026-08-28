"use client";

import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const hasMultiple = images.length > 1;

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-2xl bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>

      {hasMultiple && (
        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1} de ${name}`}
              aria-current={i === active}
              className={
                i === active
                  ? "h-16 w-16 flex-none overflow-hidden rounded-lg ring-2 ring-copper"
                  : "h-16 w-16 flex-none overflow-hidden rounded-lg ring-1 ring-line hover:ring-copper/50"
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
