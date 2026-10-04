"use client";

import { useState } from "react";
import type { MarqueeTab, ProductTabKey } from "./product-showcase-data";

type FeatureMarqueeProps = {
  tabs: readonly MarqueeTab[];
  activeKey: ProductTabKey;
  onSelect: (key: ProductTabKey) => void;
};

const ROWS = [
  { direction: "right", duration: "45s" },
  { direction: "left", duration: "50s" },
] as const;

export function FeatureMarquee({
  tabs,
  activeKey,
  onSelect,
}: FeatureMarqueeProps) {
  const [pausedRow, setPausedRow] = useState<number | null>(null);

  // duplicated so each row's translateX(-50%) loop is seamless
  const items = [...tabs, ...tabs];

  return (
    <div className="relative mt-8 w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-background to-transparent" />

      <div className="flex flex-col gap-3">
        {ROWS.map((row, rowIndex) => (
          <div
            key={row.direction}
            className="marquee-container"
            onMouseEnter={() => setPausedRow(rowIndex)}
            onMouseLeave={() => setPausedRow(null)}
            onFocus={() => setPausedRow(rowIndex)}
            onBlur={() => setPausedRow(null)}
          >
            <div
              className={`marquee-track ${
                row.direction === "right" ? "marquee-right" : "marquee-left"
              }`}
              style={{
                animationDuration: row.duration,
                animationPlayState: pausedRow === rowIndex ? "paused" : "running",
              }}
            >
              {items.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = tab.key === activeKey;

                return (
                  <button
                    key={`${row.direction}-${tab.key}-${index}`}
                    type="button"
                    onClick={() => onSelect(tab.key)}
                    aria-pressed={isActive}
                    className={`flex shrink-0 items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-border bg-card text-foreground/80 hover:border-primary hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
