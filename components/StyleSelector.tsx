"use client";

import type { NarrationStyle } from "@/lib/types";
import { useI18n } from "@/components/LanguageProvider";

interface StyleSelectorProps {
  value: NarrationStyle;
  onChange: (s: NarrationStyle) => void;
  disabled?: boolean;
}

const OPTION_IDS: readonly NarrationStyle[] = ["classic", "hype"];

export default function StyleSelector({
  value,
  onChange,
  disabled = false,
}: StyleSelectorProps) {
  const { m } = useI18n();

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;

    const currentIndex = OPTION_IDS.indexOf(value);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (currentIndex + 1) % OPTION_IDS.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (currentIndex - 1 + OPTION_IDS.length) % OPTION_IDS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = OPTION_IDS.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      onChange(OPTION_IDS[nextIndex]);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={m.style.groupAria}
      aria-disabled={disabled || undefined}
      onKeyDown={handleKeyDown}
      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
    >
      {OPTION_IDS.map((id) => {
        const selected = id === value;
        const label = m.style[id];

        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${label.title}: ${label.subtitle}`}
            disabled={disabled}
            tabIndex={disabled ? -1 : selected ? 0 : -1}
            onClick={() => {
              if (!disabled) onChange(id);
            }}
            className={[
              "flex flex-col items-start rounded-xl border px-4 py-3 text-left",
              "transition-colors duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "focus-visible:ring-ouro focus-visible:ring-offset-noite-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              selected
                ? "border-ouro bg-ouro/15 text-giz"
                : "border-giz/20 bg-transparent text-giz hover:border-giz/40",
            ].join(" ")}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="text-base font-semibold">{label.title}</span>
              <span
                aria-hidden="true"
                className={[
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  selected ? "border-ouro" : "border-giz/40",
                ].join(" ")}
              >
                {selected ? (
                  <span className="h-2 w-2 rounded-full bg-ouro" />
                ) : null}
              </span>
            </span>
            <span className="mt-0.5 text-sm text-giz-dim">{label.subtitle}</span>
          </button>
        );
      })}
    </div>
  );
}
