"use client";

import { useState } from "react";
import VideoUpload from "@/components/VideoUpload";
import StyleSelector from "@/components/StyleSelector";
import NarrationPlayer from "@/components/NarrationPlayer";
import { DEFAULT_STYLE } from "@/lib/config";
import type { NarrateResponse, NarrationStyle } from "@/lib/types";

type Status = "idle" | "loading" | "done" | "error";

/** Generic fallback shown when the API returns no usable message. */
const FALLBACK_ERROR =
  "Deu ruim na jogada. Não rolou gerar a narração agora — tenta de novo.";

export default function Home() {
  const [video, setVideo] = useState<File | null>(null);
  const [style, setStyle] = useState<NarrationStyle>(DEFAULT_STYLE);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<NarrateResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isLoading = status === "loading";
  const canGenerate = video != null && !isLoading;

  async function handleGenerate() {
    if (!video || isLoading) return;

    setStatus("loading");
    setErrorMsg(null);

    const form = new FormData();
    form.append("video", video);
    form.append("style", style);

    try {
      const res = await fetch("/api/narrate", { method: "POST", body: form });

      if (res.ok) {
        const data = (await res.json()) as NarrateResponse;
        setResult(data);
        setStatus("done");
        return;
      }

      let message = FALLBACK_ERROR;
      try {
        const body = (await res.json()) as { error?: string };
        if (body?.error) message = body.error;
      } catch {
        // Non-JSON error body — keep the fallback message.
      }
      setErrorMsg(message);
      setStatus("error");
    } catch {
      setErrorMsg("Sem sinal. Confere sua conexão e chuta de novo.");
      setStatus("error");
    }
  }

  /** Back to the booth: keep the video, clear the last narration. */
  function handleReset() {
    setResult(null);
    setStatus("idle");
    setErrorMsg(null);
  }

  return (
    <main className="pitch-glow relative flex min-h-full flex-col items-center overflow-hidden px-4 pb-16 pt-10 sm:pt-14">
      {/* ---------- Hero ---------- */}
      <header className="varzea-field relative flex w-full max-w-2xl flex-col items-center pb-8 text-center sm:pb-10">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-ouro/40 bg-ouro/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-ouro">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ouro" />
          rádio de várzea
        </span>

        <h1 className="wordmark text-5xl leading-[0.92] tracking-tight sm:text-7xl">
          NARRA
          <span
            className="text-ouro"
            style={{ WebkitTextFillColor: "currentColor" }}
          >
            MEU
          </span>
          GOL
        </h1>

        <p className="mt-4 max-w-md text-balance text-base text-giz-dim sm:text-lg">
          a IA que narra seu gol de várzea <span aria-hidden="true">⚽</span>
        </p>
      </header>

      {/* ---------- Booth card ---------- */}
      <section
        aria-label="Gerar narração"
        className="relative w-full max-w-2xl rounded-3xl border border-grama/40 bg-noite-2/80 p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:p-7"
      >
        {status === "done" && result ? (
          <DoneState video={video} result={result} onReset={handleReset} />
        ) : (
          <div className="flex flex-col gap-6">
            {/* Controls sit on a chalk surface so the components read clearly. */}
            <div className="rounded-2xl bg-giz p-4 shadow-inner sm:p-5">
              <VideoUpload
                value={video}
                onChange={setVideo}
                disabled={isLoading}
              />
            </div>

            <fieldset className="flex flex-col gap-3" disabled={isLoading}>
              <legend className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-giz">
                <span aria-hidden="true">🎙️</span>
                Estilo do locutor
              </legend>
              <StyleSelector
                value={style}
                onChange={setStyle}
                disabled={isLoading}
              />
            </fieldset>

            {status === "error" && errorMsg ? (
              <ErrorBanner message={errorMsg} onRetry={handleGenerate} />
            ) : null}

            {isLoading ? (
              <LoadingState />
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-ouro px-6 py-5 text-lg font-black uppercase tracking-wide text-noite shadow-[0_12px_0_-2px_var(--color-ouro-dark)] transition-all duration-150 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:shadow-[0_4px_0_-2px_var(--color-ouro-dark)] focus:outline-none focus-visible:ring-4 focus-visible:ring-ouro/50 focus-visible:ring-offset-2 focus-visible:ring-offset-noite-2 disabled:cursor-not-allowed disabled:bg-giz-dim disabled:text-noite/50 disabled:shadow-none"
              >
                <span aria-hidden="true" className="text-2xl">
                  ⚽
                </span>
                Gerar narração
              </button>
            )}

            {!canGenerate && !isLoading && status !== "error" ? (
              <p className="text-center text-sm text-giz-dim">
                Suba o vídeo do lance para o locutor entrar em campo.
              </p>
            ) : null}
          </div>
        )}
      </section>

      <footer className="mt-10 max-w-md text-center text-xs text-giz-dim/70">
        Feito na várzea, com café e paixão. Nada é salvo — recarregou, perdeu o
        lance.
      </footer>
    </main>
  );
}

/* ---------------- Loading ---------------- */

function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 rounded-2xl border border-ouro/30 bg-noite/60 px-6 py-8 text-center"
    >
      <span className="animate-noar inline-flex items-center gap-2 rounded-full bg-poeira px-4 py-1.5 text-sm font-black uppercase tracking-[0.2em] text-giz">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-giz" />
        No ar
      </span>

      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="animate-signal h-6 w-6 rounded-full border-[3px] border-ouro/25 border-t-ouro"
        />
        <p className="text-lg font-bold text-giz">
          Aquecendo o locutor… <span aria-hidden="true">🎙️</span>
        </p>
      </div>

      <p className="max-w-xs text-sm text-giz-dim">
        Analisando o lance e escrevendo a narração. Já já sai o gooool.
      </p>
    </div>
  );
}

/* ---------------- Error ---------------- */

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-poeira/50 bg-poeira/10 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm font-medium text-giz">
        <span aria-hidden="true" className="mr-1">
          📻
        </span>
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-xl bg-poeira px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-giz transition-colors hover:bg-poeira-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-poeira focus-visible:ring-offset-2 focus-visible:ring-offset-noite-2"
      >
        Tentar de novo
      </button>
    </div>
  );
}

/* ---------------- Done ---------------- */

function DoneState({
  video,
  result,
  onReset,
}: {
  video: File | null;
  result: NarrateResponse;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-ouro">
          Gooool! Tá no ar
        </span>
        <p className="text-sm text-giz-dim">
          Dá o play pra ouvir a narração do seu lance.
        </p>
      </div>

      {/* NarrationPlayer requires a File; done state only renders with one set. */}
      {video ? (
        <NarrationPlayer
          videoFile={video}
          script={result.script}
          audioBase64={result.audioBase64}
          mime={result.mime}
        />
      ) : null}

      <button
        type="button"
        onClick={onReset}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-ouro/60 bg-transparent px-6 py-4 text-base font-black uppercase tracking-wide text-ouro transition-colors hover:bg-ouro/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-ouro/40 focus-visible:ring-offset-2 focus-visible:ring-offset-noite-2"
      >
        <span aria-hidden="true">🔁</span>
        Narrar outro lance
      </button>
    </div>
  );
}
