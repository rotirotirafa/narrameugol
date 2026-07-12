/**
 * In-browser video muxing with ffmpeg.wasm: burns the narration audio into the
 * (muted) clip and returns a single mp4 Blob ready to post.
 *
 * Runs entirely client-side. The core is single-threaded (no SharedArrayBuffer,
 * so no cross-origin-isolation headers are required) and fetched from a CDN on
 * demand. Everything is dynamically imported so ffmpeg never lands in the SSR
 * output or the initial JS bundle — it only loads when the user asks for it.
 */
import type { FFmpeg } from "@ffmpeg/ffmpeg";

// Core release compatible with @ffmpeg/ffmpeg 0.12.x (single-threaded build).
const CORE_VERSION = "0.12.10";
const CORE_BASE = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

let ffmpegPromise: Promise<FFmpeg> | null = null;

/** Loads (once) and returns a ready FFmpeg instance. */
async function loadFFmpeg(): Promise<FFmpeg> {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${CORE_BASE}/ffmpeg-core.js`,
          "text/javascript",
        ),
        wasmURL: await toBlobURL(
          `${CORE_BASE}/ffmpeg-core.wasm`,
          "application/wasm",
        ),
      });
      return ffmpeg;
    })().catch((err) => {
      // Reset so a later attempt can retry (e.g. after a network hiccup).
      ffmpegPromise = null;
      throw err;
    });
  }
  return ffmpegPromise;
}

/** Derives a safe ffmpeg input filename (keeping the original extension). */
function inputName(file: File): string {
  const ext = /\.[a-z0-9]+$/i.exec(file.name)?.[0]?.toLowerCase() ?? ".mp4";
  return `input${ext}`;
}

export interface BurnOptions {
  /** Mime of the base64 audio (defaults to audio/mpeg). */
  mime?: string;
  /** Progress in the 0..1 range while ffmpeg encodes. */
  onProgress?: (ratio: number) => void;
}

/**
 * Muxes the narration mp3 (base64) into the muted clip and returns an mp4 Blob.
 * The video stream is copied (fast, no re-encode) and the narration is encoded
 * to AAC, replacing any original audio.
 *
 * @throws if ffmpeg fails to load or the clip can't be remuxed (e.g. an exotic
 *   codec). Callers should fall back to the manual "download + edit" path.
 */
export async function burnNarration(
  videoFile: File,
  audioBase64: string,
  { mime = "audio/mpeg", onProgress }: BurnOptions = {},
): Promise<Blob> {
  const { fetchFile } = await import("@ffmpeg/util");
  const ffmpeg = await loadFFmpeg();

  const handleProgress = (event: { progress: number }) => {
    if (onProgress) {
      onProgress(Math.max(0, Math.min(1, event.progress)));
    }
  };
  ffmpeg.on("progress", handleProgress);

  const inName = inputName(videoFile);
  const audioName = "narration.mp3";
  const outName = "narrameugol.mp4";

  try {
    await ffmpeg.writeFile(inName, await fetchFile(videoFile));
    await ffmpeg.writeFile(
      audioName,
      await fetchFile(`data:${mime};base64,${audioBase64}`),
    );

    // Copy the video track, add the narration as AAC, end at the shorter of the
    // two streams. faststart makes the mp4 stream-friendly for social apps.
    await ffmpeg.exec([
      "-i", inName,
      "-i", audioName,
      "-map", "0:v:0",
      "-map", "1:a:0",
      "-c:v", "copy",
      "-c:a", "aac",
      "-shortest",
      "-movflags", "+faststart",
      outName,
    ]);

    const data = await ffmpeg.readFile(outName);
    if (typeof data === "string") {
      throw new Error("ffmpeg retornou o vídeo em formato inesperado.");
    }
    // Copy into a fresh ArrayBuffer so the Blob owns its bytes.
    return new Blob([data.slice()], { type: "video/mp4" });
  } finally {
    ffmpeg.off("progress", handleProgress);
    for (const name of [inName, audioName, outName]) {
      try {
        await ffmpeg.deleteFile(name);
      } catch {
        // Best-effort cleanup of the virtual FS.
      }
    }
  }
}
