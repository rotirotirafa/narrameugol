/**
 * Shared contracts between the browser and the /api/narrate route handler.
 * Single source of truth — see docs/definitions/api-contract.md.
 */

/** Commentator tone selected by the user. */
export type NarrationStyle = "classic" | "hype";

/** Successful body of POST /api/narrate (HTTP 200). */
export interface NarrateResponse {
  /** The Brazilian radio-broadcaster script that was narrated (PT-BR). */
  script: string;
  /** Base64-encoded mp3 of the narration. */
  audioBase64: string;
  /** Audio mime type — always "audio/mpeg" for now. */
  mime: "audio/mpeg";
}

/** Error body of POST /api/narrate (HTTP 400/413/500/502). */
export interface NarrateError {
  /** Human-readable, PT-BR message safe to show the user. */
  error: string;
}
