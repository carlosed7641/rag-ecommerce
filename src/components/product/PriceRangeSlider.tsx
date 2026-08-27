"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";

const THUMB =
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-copper [&::-webkit-slider-thumb]:bg-bg [&::-webkit-slider-thumb]:shadow-sm " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-copper [&::-moz-range-thumb]:bg-bg [&::-moz-range-thumb]:shadow-sm";

export function PriceRangeSlider({
  boundsMin,
  boundsMax,
  defaultMin,
  defaultMax,
  step = 10000,
}: {
  boundsMin: number;
  boundsMax: number;
  defaultMin?: number;
  defaultMax?: number;
  step?: number;
}) {
  const [minVal, setMinVal] = useState(defaultMin ?? boundsMin);
  const [maxVal, setMaxVal] = useState(defaultMax ?? boundsMax);

  const span = Math.max(boundsMax - boundsMin, 1);
  const minPct = ((minVal - boundsMin) / span) * 100;
  const maxPct = ((maxVal - boundsMin) / span) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-4">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-line" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-copper"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <input
          type="range"
          name="min"
          aria-label="Precio mínimo"
          min={boundsMin}
          max={boundsMax}
          step={step}
          value={minVal}
          onChange={(e) => setMinVal(Math.min(Number(e.target.value), maxVal - step))}
          className={`absolute inset-x-0 top-1/2 h-4 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent ${THUMB}`}
          style={{ pointerEvents: "none" }}
        />
        <input
          type="range"
          name="max"
          aria-label="Precio máximo"
          min={boundsMin}
          max={boundsMax}
          step={step}
          value={maxVal}
          onChange={(e) => setMaxVal(Math.max(Number(e.target.value), minVal + step))}
          className={`absolute inset-x-0 top-1/2 h-4 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent ${THUMB}`}
          style={{ pointerEvents: "none" }}
        />
      </div>
      <div className="flex items-center justify-between text-sm text-ink">
        <span>{formatCurrency(minVal)}</span>
        <span>{formatCurrency(maxVal)}</span>
      </div>
    </div>
  );
}
