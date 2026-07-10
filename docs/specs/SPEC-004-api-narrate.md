# SPEC-004 — Orquestração `POST /api/narrate`

- **Status:** Rascunho
- **Épico:** [Épico 2](../roadmap.md#épico-2--rota-de-orquestração-apinarrate)
- **Arquivos-alvo:** `app/api/narrate/route.ts`, `lib/types.ts`

## Objetivo

Único endpoint server-side que valida o upload, orquestra Gemini→(fallback)→ElevenLabs e devolve roteiro + áudio em JSON.

## Contexto & referências

- Contrato detalhado: [`api-contract.md`](../definitions/api-contract.md).
- [ADR-0002](../architecture/decisions.md#adr-0002--um-único-route-handler-orquestrador), [ADR-0003](../architecture/decisions.md#adr-0003--chaves-de-api-somente-no-servidor), [ADR-0005](../architecture/decisions.md#adr-0005--áudio-como-base64-no-json).

## Requisitos funcionais

- **RF-1:** Aceita `POST` com `multipart/form-data`: `video` (File) e `style` (`classic` | `hype`).
- **RF-2:** Valida o upload ([SPEC-001](./SPEC-001-video-upload.md)) e mapeia erros: `400` (sem/invalid video), `413` (grande demais).
- **RF-3:** Chama a geração de roteiro ([SPEC-002](./SPEC-002-script-generation.md)); em falha do Gemini, usa o fallback e continua.
- **RF-4:** Chama o TTS ([SPEC-003](./SPEC-003-text-to-speech.md)); em falha do ElevenLabs, responde `502`.
- **RF-5:** Converte o áudio para base64 e retorna `200 { script, audioBase64, mime: "audio/mpeg" }`.
- **RF-6:** Erros inesperados → `500`. Nada de chave/segredo vaza para a resposta ou para o cliente.
- **RF-7:** As chaves são lidas apenas de variáveis de ambiente no servidor.

## Requisitos não-funcionais

- Tempo total dominado por duas chamadas de IA em série — manter clipes curtos.
- Logs no servidor distinguem: falha de validação, fallback acionado, falha de TTS, erro inesperado.
- Payload da resposta atento aos limites da função serverless ([ADR-0005](../architecture/decisions.md#adr-0005--áudio-como-base64-no-json)).

## Interface / contrato

```ts
// lib/types.ts (esboço)
type NarrationStyle = "classic" | "hype";

interface NarrateResponse {
  script: string;
  audioBase64: string;
  mime: "audio/mpeg";
}
```

| Situação | Status | Corpo |
|----------|--------|-------|
| Sucesso | `200` | `{ script, audioBase64, mime }` |
| Sem/invalid vídeo | `400` | `{ error }` |
| Vídeo grande demais | `413` | `{ error }` |
| Falha Gemini **e** ElevenLabs / falha ElevenLabs | `502` | `{ error }` |
| Erro inesperado | `500` | `{ error }` |

> Falha **só** do Gemini **não** é erro: cai no fallback e segue para `200`.

## Regras de negócio & edge cases

- `style` ausente/ inválido → assume `classic`.
- Gemini vazio/erro → fallback (não aborta).
- ElevenLabs erro → `502` (sem áudio para entregar).
- Corpo de erro nunca inclui detalhes sensíveis do provedor.

## Critérios de aceitação

- **CA-1:** *Dado* um clipe válido, *então* retorna `200` com `script` não-vazio e `audioBase64` decodificável em mp3.
- **CA-2:** *Dado* o Gemini forçado a falhar, *então* ainda retorna `200` (via fallback).
- **CA-3:** *Dado* o ElevenLabs forçado a falhar, *então* retorna `502`.
- **CA-4:** *Dado* request sem vídeo → `400`; vídeo acima do limite → `413`.
- **CA-5:** *Verificado* que nenhuma chave aparece na resposta nem no bundle do cliente.

## Fora de escopo

- Streaming da resposta; autenticação; rate limiting.

## Dependências

- [SPEC-001](./SPEC-001-video-upload.md), [SPEC-002](./SPEC-002-script-generation.md), [SPEC-003](./SPEC-003-text-to-speech.md).
