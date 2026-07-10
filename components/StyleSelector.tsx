"use client";

import type { NarrationStyle } from "@/lib/types";

interface StyleSelectorProps {
  value: NarrationStyle;
  onChange: (s: NarrationStyle) => void;
  disabled?: boolean;
}

interface StyleOption {
  id: NarrationStyle;
  title: string;
  subtitle: string;
}

const OPTIONS: readonly StyleOption[] = [
  {
    id: "classic",
    title: "Clássico",
    subtitle: "locutor de rádio comedido",
  },
  {
    id: "hype",
    title: "Empolgadão",
    subtitle: "narração over-the-top",
  },
] as const;

export default function StyleSelector({
  value,
  onChange,
  disabled = false,
}: StyleSelectorProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;

    const currentIndex = OPTIONS.findIndex((o) => o.id === value);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (currentIndex + 1) % OPTIONS.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (currentIndex - 1 + OPTIONS.length) % OPTIONS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = OPTIONS.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      onChange(OPTIONS[nextIndex].id);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Estilo da narração"
      aria-disabled={disabled || undefined}
      onKeyDown={handleKeyDown}
      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
    >
      {OPTIONS.map((option) => {
        const selected = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${option.title}: ${option.subtitle}`}
            disabled={disabled}
            tabIndex={disabled ? -1 : selected ? 0 : -1}
            onClick={() => {
              if (!disabled) onChange(option.id);
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
              <span className="text-base font-semibold">{option.title}</span>
              <span
                aria-hidden="true"
                className={[
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  selected
                    ? "border-ouro"
                    : "border-giz/40",
                ].join(" ")}
              >
                {selected ? (
                  <span className="h-2 w-2 rounded-full bg-ouro" />
                ) : null}
              </span>
            </span>
            <span className="mt-0.5 text-sm text-giz-dim">
              {option.subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
}
