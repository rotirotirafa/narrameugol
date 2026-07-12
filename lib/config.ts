/**
 * Non-secret configuration shared across the app.
 * Secrets live in environment variables — see docs/definitions/environment.md.
 */
import type { NarrationStyle } from "./types";

/**
 * Max accepted upload size. Vercel Functions cap the request body at ~4.5 MB
 * (a platform limit, even on Pro), so keep uploads under that. For bigger clips
 * the real fix is a direct client→storage upload (e.g. Vercel Blob) that sends
 * only a URL to the route — a future improvement.
 */
export const MAX_VIDEO_BYTES = 4 * 1024 * 1024; // 4 MB

/** Accepted upload mime types must start with this. */
export const VIDEO_MIME_PREFIX = "video/";

/** All valid narration styles (used for validation). */
export const NARRATION_STYLES = ["classic", "hype"] as const;

/** Style assumed when none/invalid is provided. */
export const DEFAULT_STYLE: NarrationStyle = "classic";

/**
 * Model ids. These come from the brief and should be confirmed against the
 * current provider docs before relying on them (roadmap task 1.6).
 */
export const GEMINI_MODEL = "gemini-2.5-flash";
export const GEMINI_MODEL_STRONG = "gemini-2.5-pro"; // only if video reading is weak
// Eleven v3 é o mais expressivo, mas o acesso via API é restrito (planos pagos /
// acesso liberado ao v3). eleven_multilingual_v2 é o padrão confiável e com ótimo
// PT-BR; troque para ELEVENLABS_MODEL_EXPRESSIVE se sua conta tiver acesso ao v3.
export const ELEVENLABS_MODEL = "eleven_multilingual_v2";
export const ELEVENLABS_MODEL_EXPRESSIVE = "eleven_v3"; // requer acesso à API do v3
export const ELEVENLABS_MODEL_FAST = "eleven_flash_v2_5"; // menor latência

/** ElevenLabs mp3 output format id. */
export const ELEVENLABS_OUTPUT_FORMAT = "mp3_44100_128";

/** Audio mime returned to the client. */
export const AUDIO_MIME = "audio/mpeg" as const;
