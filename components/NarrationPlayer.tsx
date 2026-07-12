"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/LanguageProvider";

interface NarrationPlayerProps {
  /** The clip the user uploaded (played muted, in sync with the narration). */
  videoFile: File;
  /** The generated broadcaster script (PT-BR). */
  script: string;
  /** Base64-encoded mp3 of the narration. */
  audioBase64: string;
  /** Audio mime type. Defaults to "audio/mpeg". */
  mime?: string;
}

/**
 * Plays the uploaded clip (muted) together with the AI-generated narration
 * audio, shows the script, and lets the user download the mp3.
 *
 * The video is driven from an object URL created from `videoFile`; the audio
 * uses a base64 data URL. Playback of both elements is kicked off by a single
 * user click so browser autoplay policies are satisfied.
 */
export default function NarrationPlayer({
  videoFile,
  script,
  audioBase64,
  mime,
}: NarrationPlayerProps) {
  const { m } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  // Data URL for the mp3 — stable for a given audio payload, used both as the
  // <audio> source and the download href.
  const audioSrc = `data:${mime ?? "audio/mpeg"};base64,${audioBase64}`;

  // Own the uploaded clip's object URL: create it for the current file, wire it
  // onto the <video> imperatively, and revoke it on change/unmount so we never
  // leak blob URLs. Creating inside the effect (rather than in render/useMemo)
  // keeps this correct under React Strict Mode's mount→unmount→remount cycle —
  // each mount gets a fresh URL, and no setState runs inside the effect.
  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    const video = videoRef.current;
    if (video) video.src = url;

    return () => {
      URL.revokeObjectURL(url);
      if (video) video.removeAttribute("src");
    };
  }, [videoFile]);

  // Keep the play/pause state in sync with whatever the media elements do
  // (e.g. one of them reaching its end, or the user using native controls).
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlaying = () => setIsPlaying(true);

    // The narration audio is the "lead" track: when it ends or is paused we
    // reflect that in the UI. The video may be shorter or longer — that's fine.
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("playing", handlePlaying);
    // If the (usually longer) video ends first, stop the audio too so we don't
    // keep "playing" with a frozen last frame.
    video.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("playing", handlePlaying);
      video.removeEventListener("ended", handleEnded);
    };
  }, [videoFile, audioSrc]);

  async function handlePlay() {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    // Restart both tracks from the top so replay works and they line up.
    video.currentTime = 0;
    audio.currentTime = 0;

    setIsPlaying(true);
    try {
      // Fire both play() calls from within this user gesture.
      await Promise.all([video.play(), audio.play()]);
    } catch {
      // Autoplay was blocked or playback failed — reset the UI state.
      setIsPlaying(false);
      video.pause();
      audio.pause();
    }
  }

  function handlePause() {
    videoRef.current?.pause();
    audioRef.current?.pause();
    setIsPlaying(false);
  }

  return (
    <section
      className="mx-auto flex w-full max-w-2xl flex-col gap-4"
      aria-label={m.player.aria}
    >
      {/* Video (muted) — the narration audio carries the sound. The `src` is
          set imperatively by the effect that owns the object URL's lifecycle. */}
      <div className="overflow-hidden rounded-2xl bg-black shadow-lg">
        <video
          ref={videoRef}
          muted
          playsInline
          className="aspect-video w-full bg-black"
        />
      </div>

      {/* The narration track. Hidden from view; controlled via the button. */}
      <audio ref={audioRef} src={audioSrc} className="sr-only" />

      {/* Playback + download controls. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {isPlaying ? (
          <button
            type="button"
            onClick={handlePause}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-giz/20 bg-noite/60 px-6 py-4 text-lg font-semibold text-giz transition hover:bg-noite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ouro"
            aria-label={m.player.pauseAria}
          >
            {m.player.pause}
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePlay}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-ouro px-6 py-4 text-lg font-black uppercase tracking-wide text-noite shadow transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ouro disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={m.player.playAria}
          >
            {m.player.play}
          </button>
        )}

        <a
          href={audioSrc}
          download="narrameugol.mp3"
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-grama/50 px-6 py-4 text-base font-semibold text-giz transition hover:bg-grama/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ouro"
        >
          {m.player.download}
        </a>
      </div>

      {/* The broadcaster script. */}
      <div className="rounded-2xl border border-grama/30 bg-noite/60 p-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ouro">
          {m.player.scriptHeading}
        </h2>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-giz">
          {script}
        </p>
      </div>
    </section>
  );
}
