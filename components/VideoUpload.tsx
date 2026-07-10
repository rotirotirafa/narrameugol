"use client";

import { useCallback, useId, useRef, useState } from "react";
import { MAX_VIDEO_BYTES, VIDEO_MIME_PREFIX } from "@/lib/config";

interface VideoUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

/** Human-readable MB limit derived from the byte cap (no hardcoded number). */
const MAX_VIDEO_MB = Math.floor(MAX_VIDEO_BYTES / (1024 * 1024));

/** Format a byte count into a short PT-BR-friendly string (e.g. "12,3 MB"). */
function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const rounded = size >= 10 ? Math.round(size) : Math.round(size * 10) / 10;
  return `${rounded.toLocaleString("pt-BR")} ${units[unitIndex]}`;
}

export default function VideoUpload({
  value,
  onChange,
  disabled = false,
}: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const errorId = useId();

  const openPicker = useCallback(() => {
    if (disabled) {
      return;
    }
    inputRef.current?.click();
  }, [disabled]);

  const validateAndEmit = useCallback(
    (file: File | null) => {
      if (!file) {
        setError(null);
        onChange(null);
        return;
      }

      if (!file.type.startsWith(VIDEO_MIME_PREFIX)) {
        setError("O arquivo precisa ser um vídeo.");
        onChange(null);
        return;
      }

      if (file.size > MAX_VIDEO_BYTES) {
        setError(`O vídeo deve ter no máximo ${MAX_VIDEO_MB} MB.`);
        onChange(null);
        return;
      }

      setError(null);
      onChange(file);
    },
    [onChange],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      validateAndEmit(file);
      // Allow re-selecting the same file later.
      event.target.value = "";
    },
    [validateAndEmit],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (disabled) {
        return;
      }
      const file = event.dataTransfer.files?.[0] ?? null;
      validateAndEmit(file);
    },
    [disabled, validateAndEmit],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (disabled) {
        return;
      }
      setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPicker();
      }
    },
    [disabled, openPicker],
  );

  const handleClear = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      validateAndEmit(null);
      openPicker();
    },
    [openPicker, validateAndEmit],
  );

  const hasFile = value != null;

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
      />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby={error ? errorId : undefined}
        aria-label="Enviar o vídeo do seu lance"
        onClick={openPicker}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={[
          "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-grama focus-visible:ring-offset-2",
          disabled
            ? "cursor-not-allowed border-noite/10 bg-noite/5 opacity-60"
            : "cursor-pointer",
          !disabled && isDragging
            ? "border-grama bg-grama/10"
            : "border-noite/20 bg-white",
          !disabled && !isDragging ? "hover:border-grama hover:bg-grama/5" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {hasFile ? (
          <div className="flex w-full flex-col items-center gap-2">
            <svg
              className="h-8 w-8 text-grama"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m22 8-6 4 6 4V8Z" />
              <rect x="2" y="6" width="14" height="12" rx="2" ry="2" />
            </svg>
            <p className="max-w-full truncate text-sm font-medium text-noite">
              {value.name}
            </p>
            <p className="text-xs text-noite/60">{formatBytes(value.size)}</p>
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="mt-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-grama-dark underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-grama focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Trocar vídeo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg
              className="h-9 w-9 text-noite/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3v12" />
              <path d="m7 8 5-5 5 5" />
              <path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
            </svg>
            <p className="text-sm font-medium text-noite">
              Solte o vídeo do seu lance aqui ou clique para escolher
            </p>
            <p className="text-xs text-noite/60">
              Formatos de vídeo até {MAX_VIDEO_MB} MB
            </p>
          </div>
        )}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-poeira-dark">
          {error}
        </p>
      ) : null}
    </div>
  );
}
