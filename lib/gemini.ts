/**
 * Gemini integration: turns an amateur football clip into a short PT-BR
 * radio-broadcaster narration script.
 *
 * The only public entry point is {@link generateScript}. It MUST throw on any
 * failure (missing key, network error, processing failure, blocked/empty
 * response) — the caller is responsible for the fallback. It never returns an
 * empty string.
 */
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
  FileState,
  type File as GenAiFile,
} from "@google/genai";
import type { NarrationStyle } from "@/lib/types";
import { GEMINI_MODEL } from "@/lib/config";

/** Max time (ms) to wait for the uploaded file to become ACTIVE. */
const PROCESSING_TIMEOUT_MS = 60_000;
/** Delay (ms) between file-state polls. */
const POLL_INTERVAL_MS = 1_500;

/** Small promise-based sleep helper. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Builds the PT-BR prompt, adjusting the tone by the selected style.
 */
function buildPrompt(style: NarrationStyle): string {
  const tom =
    style === "hype"
      ? "Assuma a persona de um locutor MUITO empolgado, over-the-top, quase sem fôlego, gritando os melhores momentos."
      : "Assuma a persona de um locutor de rádio clássico e comedido, com emoção controlada e dicção elegante.";

  return [
    "Você é um locutor de rádio brasileiro narrando futebol amador (várzea).",
    "Assista a este lance de futebol, descreva mentalmente a sequência da jogada",
    "e escreva um roteiro CURTO (cerca de 100 palavras) de narração para ser lido em voz alta.",
    tom,
    "Use bordões brasileiros e marcações expressivas (por exemplo: GOOOL, reticências para criar suspense).",
    "NÃO invente nomes de jogadores, times, placar nem minutos de jogo.",
    "Responda APENAS com o roteiro, em português do Brasil, sem títulos, sem aspas e sem comentários adicionais.",
  ].join(" ");
}

/**
 * Uploads the clip to the Files API and waits until it is ACTIVE (Gemini
 * cannot read a video that is still PROCESSING).
 *
 * @throws if the file fails processing or does not become ACTIVE in time.
 */
async function uploadAndAwaitActive(
  ai: GoogleGenAI,
  video: File,
): Promise<GenAiFile> {
  // A browser File is a Blob; pass it directly with an explicit mime type.
  let file = await ai.files.upload({
    file: video,
    config: { mimeType: video.type || "video/mp4" },
  });

  const deadline = Date.now() + PROCESSING_TIMEOUT_MS;
  while (file.state === FileState.PROCESSING) {
    if (Date.now() >= deadline) {
      throw new Error("O processamento do vídeo pelo Gemini excedeu o tempo limite.");
    }
    if (!file.name) {
      throw new Error("O Gemini não retornou um identificador para o vídeo enviado.");
    }
    await sleep(POLL_INTERVAL_MS);
    file = await ai.files.get({ name: file.name });
  }

  if (file.state === FileState.FAILED) {
    const detail = file.error?.message ?? "motivo desconhecido";
    throw new Error(`O Gemini falhou ao processar o vídeo (${detail}).`);
  }

  if (!file.uri || !file.mimeType) {
    throw new Error("O Gemini não retornou uma referência utilizável para o vídeo.");
  }

  return file;
}

/**
 * Generates a short Brazilian radio-broadcaster narration script for the given
 * amateur football clip.
 *
 * @param video - The uploaded clip (a browser File, which is also a Blob).
 * @param style - "classic" for a measured tone, "hype" for over-the-top energy.
 * @returns A trimmed, non-empty PT-BR script.
 * @throws on any failure — missing API key, network error, processing failure,
 *         or a blocked/empty model response.
 */
export async function generateScript(
  video: File,
  style: NarrationStyle,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("A variável de ambiente GEMINI_API_KEY não está configurada.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const uploaded = await uploadAndAwaitActive(ai, video);

  const prompt = buildPrompt(style);
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: createUserContent([
      // uri and mimeType are guaranteed non-null by uploadAndAwaitActive.
      createPartFromUri(uploaded.uri as string, uploaded.mimeType as string),
      prompt,
    ]),
  });

  const script = response.text?.trim();
  if (!script) {
    throw new Error("O Gemini não retornou um roteiro (resposta vazia ou bloqueada).");
  }

  return script;
}
