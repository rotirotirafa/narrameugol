/**
 * Non-secret configuration shared across the app.
 * Secrets live in environment variables — see docs/definitions/environment.md.
 */
import type { NarrationStyle } from "./types";

/** Max accepted upload size. Kept well within serverless payload limits. */
export const MAX_VIDEO_BYTES = 20 * 1024 * 1024; // 20 MB

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
export const ELEVENLABS_MODEL = "eleven_v3";
export const ELEVENLABS_MODEL_FAST = "eleven_flash_v2_5"; // lower-latency fallback

/** ElevenLabs mp3 output format id. */
export const ELEVENLABS_OUTPUT_FORMAT = "mp3_44100_128";

/** Audio mime returned to the client. */
export const AUDIO_MIME = "audio/mpeg" as const;
