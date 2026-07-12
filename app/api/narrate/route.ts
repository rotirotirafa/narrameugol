/**
 * POST /api/narrate — único endpoint orquestrador (SPEC-004).
 *
 * Fluxo: valida o upload → gera o roteiro (Gemini, com fallback local) →
 * sintetiza o áudio (ElevenLabs) → devolve `{ script, audioBase64, mime }`.
 *
 * Regras de erro (ver docs/definitions/api-contract.md):
 *   400 — vídeo ausente ou mime inválido.
 *   413 — vídeo acima do limite de tamanho.
 *   502 — falha do ElevenLabs (não há áudio a entregar).
 *   500 — erro inesperado / configuração ausente.
 *
 * Falha SÓ do Gemini NÃO é erro: o servidor cai no fallback e ainda responde
 * 200. Nenhuma resposta expõe chaves ou detalhes internos do provedor — os
 * detalhes ficam apenas no `console.error` do servidor.
 */
import type { NarrationStyle } from "@/lib/types";
import { coerceLang, DEFAULT_LANG, messages, type Lang } from "@/lib/i18n";
import {
  AUDIO_MIME,
  DEFAULT_STYLE,
  MAX_VIDEO_BYTES,
  NARRATION_STYLES,
  VIDEO_MIME_PREFIX,
} from "@/lib/config";
import { generateScript } from "@/lib/gemini";
import { synthesizeSpeech } from "@/lib/elevenlabs";
import { fallbackScript } from "@/lib/scriptFallback";

// Os SDKs (Gemini/ElevenLabs) e o uso de Buffer exigem o runtime Node.
export const runtime = "nodejs";
// Duas chamadas de IA em série podem demorar; folga além do padrão.
export const maxDuration = 60;

/**
 * Normaliza o campo `style` do formulário: se não for um dos estilos válidos
 * (ausente, vazio ou desconhecido), assume o padrão.
 */
function coerceStyle(raw: FormDataEntryValue | null): NarrationStyle {
  if (
    typeof raw === "string" &&
    (NARRATION_STYLES as readonly string[]).includes(raw)
  ) {
    return raw as NarrationStyle;
  }
  return DEFAULT_STYLE;
}

/** Resposta de erro padrão: corpo `{ error }` em PT-BR, sem detalhes sensíveis. */
function errorResponse(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export async function POST(req: Request): Promise<Response> {
  let language: Lang = DEFAULT_LANG;
  try {
    const form = await req.formData();
    const video = form.get("video");
    const style = coerceStyle(form.get("style"));
    language = coerceLang(form.get("language"));
    const t = messages[language].apiErrors;

    // --- Validação do upload (400 / 413) ---
    if (!(video instanceof File)) {
      console.error("[narrate] validação: campo 'video' ausente ou não é um arquivo.");
      return errorResponse(t.noVideo, 400);
    }

    if (!video.type.startsWith(VIDEO_MIME_PREFIX)) {
      console.error(
        `[narrate] validação: tipo de arquivo inválido (${video.type || "desconhecido"}).`,
      );
      return errorResponse(t.notVideo, 400);
    }

    if (video.size > MAX_VIDEO_BYTES) {
      console.error(
        `[narrate] validação: vídeo grande demais (${video.size} > ${MAX_VIDEO_BYTES} bytes).`,
      );
      return errorResponse(t.tooLarge, 413);
    }

    // --- Roteiro: Gemini com fallback local (falha do Gemini NÃO vira erro) ---
    let script: string;
    try {
      script = await generateScript(video, style, language);
    } catch (err) {
      console.error("[narrate] fallback acionado: falha ao gerar roteiro no Gemini.", err);
      script = fallbackScript(style, language);
    }

    if (!script.trim()) {
      console.error("[narrate] fallback acionado: roteiro vazio após a geração.");
      script = fallbackScript(style, language);
    }

    // --- Áudio: ElevenLabs (falha => 502, sem áudio a entregar) ---
    let audio: Buffer;
    try {
      audio = await synthesizeSpeech(script);
    } catch (err) {
      console.error("[narrate] falha de TTS: o ElevenLabs não gerou o áudio.", err);
      return errorResponse(t.ttsFailed, 502);
    }

    // --- Sucesso ---
    return Response.json(
      {
        script,
        audioBase64: audio.toString("base64"),
        mime: AUDIO_MIME,
      },
      { status: 200 },
    );
  } catch (err) {
    // Qualquer coisa inesperada (ex.: formData malformado, erro de runtime).
    console.error("[narrate] erro inesperado ao processar a requisição.", err);
    return errorResponse(messages[language].apiErrors.unexpected, 500);
  }
}
