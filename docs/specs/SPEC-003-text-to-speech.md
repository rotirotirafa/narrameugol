# SPEC-003 — Text-to-speech (ElevenLabs)

- **Status:** Rascunho
- **Épico:** [Épico 1](../roadmap.md#épico-1--spikes-de-integração-de-ia-isolados)
- **Arquivos-alvo:** `lib/elevenlabs.ts`

## Objetivo

Converter o roteiro em um mp3 narrado por uma voz de locutor brasileiro.

## Contexto & referências

- [`BRIEF.md`](../../BRIEF.md) — seção "ElevenLabs".

## Requisitos funcionais

- **RF-1:** `lib/elevenlabs.ts` usa `@elevenlabs/elevenlabs-js`, `ElevenLabsClient` inicializado com `ELEVENLABS_API_KEY`.
- **RF-2:** Modelo **Eleven v3** (mais expressivo, suporta PT-BR); **Flash v2.5** como fallback de menor latência.
- **RF-3:** Usa uma voz de locutor PT-BR cujo id vem de `ELEVENLABS_VOICE_ID`.
- **RF-4:** Recebe o roteiro (string) e retorna o áudio como `Buffer`/bytes; a conversão para base64 acontece na rota ([SPEC-004](./SPEC-004-api-narrate.md)).
- **RF-5:** Formato de saída mp3 (`audio/mpeg`).

## Requisitos não-funcionais

- Latência aceitável para demo ao vivo (considerar Flash v2.5 se v3 ficar lento).
- Não vazar a chave; toda chamada é server-side.

## Interface / contrato

```ts
// esboço — ajustar aos tipos reais em lib/types.ts
synthesizeSpeech(script: string): Promise<Buffer>  // mp3 bytes
```

## Regras de negócio & edge cases

- Roteiro vazio → não chamar a API; tratar como erro upstream (não deveria ocorrer, pois há fallback de roteiro).
- Falha do ElevenLabs → propaga para a rota, que responde `502` (não há áudio a entregar). Ver [`data-flow.md`](../architecture/data-flow.md).
- `ELEVENLABS_VOICE_ID` ausente → falha de configuração (`500`), reportada nos logs.

## Critérios de aceitação

- **CA-1:** *Dado* um roteiro em PT-BR, *quando* `synthesizeSpeech` roda, *então* retorna bytes de mp3 audíveis.
- **CA-2:** *Dado* o teste isolado (roadmap 1.5), *então* salva um mp3 em disco que reproduz a narração corretamente.
- **CA-3:** *Dado* falha da API, *então* a função propaga o erro para a rota mapear como `502`.

## Fora de escopo

- Seleção de voz pelo usuário (voz é fixa via env no MVP).
- Efeitos/mixagem de áudio (torcida, ambiente) — poderiam entrar em stretch.

## Dependências

- Chaves em [`environment.md`](../definitions/environment.md).
- Consome a saída de [SPEC-002](./SPEC-002-script-generation.md); consumido por [SPEC-004](./SPEC-004-api-narrate.md).
