/**
 * ElevenLabs text-to-speech wrapper.
 *
 * Exposes a single function that turns a narration script into mp3 bytes using
 * the ElevenLabs SDK (@elevenlabs/elevenlabs-js). Secrets are read lazily from
 * the environment so importing this module never throws.
 */
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

import { ELEVENLABS_MODEL, ELEVENLABS_OUTPUT_FORMAT } from "@/lib/config";

/** Minimal shape of a Node.js Readable stream, checked at runtime. */
type NodeReadableLike = AsyncIterable<Uint8Array>;

/**
 * Type guard for a Web ReadableStream (has a `getReader` method).
 */
function isWebReadableStream(
  value: unknown,
): value is ReadableStream<Uint8Array> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { getReader?: unknown }).getReader === "function"
  );
}

/**
 * Type guard for a Node.js Readable (async-iterable) stream.
 */
function isAsyncIterable(value: unknown): value is NodeReadableLike {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { [Symbol.asyncIterator]?: unknown })[
      Symbol.asyncIterator
    ] === "function"
  );
}

/**
 * Collects every chunk emitted by the audio stream into a single Buffer.
 *
 * The SDK's `convert()` resolves to a Web `ReadableStream<Uint8Array>`, but we
 * defensively support a Node `Readable` (async iterable) as well so this works
 * across runtimes.
 */
async function streamToBuffer(stream: unknown): Promise<Buffer> {
  const chunks: Buffer[] = [];

  if (isWebReadableStream(stream)) {
    const reader = stream.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(Buffer.from(value));
      }
    } finally {
      reader.releaseLock();
    }
  } else if (isAsyncIterable(stream)) {
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
  } else {
    throw new Error(
      "Falha ao gerar o áudio: formato de resposta inesperado do ElevenLabs.",
    );
  }

  const audio = Buffer.concat(chunks);
  if (audio.length === 0) {
    throw new Error("Falha ao gerar o áudio: o ElevenLabs retornou áudio vazio.");
  }
  return audio;
}

/**
 * Synthesizes the given narration script to speech and returns the mp3 bytes.
 *
 * @param script - The narration text to convert to speech.
 * @returns A Buffer containing the generated mp3 audio.
 * @throws If the required environment variables are missing or the ElevenLabs
 *   request fails.
 */
export async function synthesizeSpeech(script: string): Promise<Buffer> {
  const trimmed = script?.trim();
  if (!trimmed) {
    throw new Error("Não é possível gerar o áudio: o roteiro está vazio.");
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Variável de ambiente ELEVENLABS_API_KEY ausente. Configure-a para gerar o áudio.",
    );
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!voiceId) {
    throw new Error(
      "Variável de ambiente ELEVENLABS_VOICE_ID ausente. Configure-a para gerar o áudio.",
    );
  }

  const client = new ElevenLabsClient({ apiKey });

  let stream: unknown;
  try {
    stream = await client.textToSpeech.convert(voiceId, {
      text: trimmed,
      modelId: ELEVENLABS_MODEL,
      outputFormat: ELEVENLABS_OUTPUT_FORMAT,
    });
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    throw new Error(`Falha na requisição ao ElevenLabs: ${detail}`, { cause });
  }

  return streamToBuffer(stream);
}
