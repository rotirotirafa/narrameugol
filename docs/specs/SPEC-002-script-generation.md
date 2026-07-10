# SPEC-002 — Geração do roteiro (Gemini) + fallback

- **Status:** Rascunho
- **Épico:** [Épico 1](../roadmap.md#épico-1--spikes-de-integração-de-ia-isolados)
- **Arquivos-alvo:** `lib/gemini.ts`, `lib/scriptFallback.ts`

## Objetivo

A partir do clipe, produzir um roteiro curto de locutor de rádio brasileiro empolgado, em PT-BR — com um fallback que garante roteiro mesmo se o Gemini falhar.

## Contexto & referências

- [`BRIEF.md`](../../BRIEF.md) — seção "Gemini" com o prompt de referência.
- [ADR-0004](../architecture/decisions.md#adr-0004--fallback-de-roteiro-quando-o-gemini-falha).

## Requisitos funcionais

- **RF-1:** `lib/gemini.ts` envia o vídeo ao Gemini usando a **File API** (inline apenas para arquivos muito pequenos) e um prompt em PT-BR.
- **RF-2:** SDK `@google/genai`, classe `GoogleGenAI`, método `ai.models.generateContent()`, modelo `gemini-2.5-flash` (subir para `gemini-2.5-pro` só se a leitura ficar fraca).
- **RF-3:** O prompt pede um roteiro **curto (~100 palavras)**, com bordões e marcações expressivas (ex.: "GOOOL", reticências para suspense), e proíbe inventar **nomes de jogadores** ou **minutos**. A resposta deve conter **apenas o roteiro**.
- **RF-4:** O tom varia conforme `style`: `classic` = rádio medido; `hype` = over-the-top.
- **RF-5:** `lib/scriptFallback.ts` retorna um roteiro hype genérico (também parametrizado por `style`), **sem** chamadas de rede.
- **RF-6:** Qualquer falha do Gemini (erro, timeout, resposta vazia) faz o orquestrador usar o fallback (a decisão de cair no fallback é da rota — ver [SPEC-004](./SPEC-004-api-narrate.md)).

## Requisitos não-funcionais

- Roteiro sempre em PT-BR.
- Latência baixa (`gemini-2.5-flash`); manter clipes curtos.
- Prompt versionado no código para fácil ajuste de tom.

## Interface / contrato

```ts
// esboço — ajustar aos tipos reais em lib/types.ts
generateScript(video: File | Buffer, style: NarrationStyle): Promise<string>
fallbackScript(style: NarrationStyle): string
```

- Saída: string de roteiro pronta para TTS. Sem markdown, sem preâmbulo.

## Regras de negócio & edge cases

- Resposta do Gemini vazia ou claramente inválida → tratada como falha → fallback.
- `style` desconhecido → tratar como `classic`.
- O roteiro não deve conter nomes próprios inventados nem cronômetro (reforçado pelo prompt).

## Critérios de aceitação

- **CA-1:** *Dado* um clipe de gol, *quando* `generateScript` roda, *então* retorna um roteiro curto em PT-BR, empolgado, sem nomes/minutos inventados.
- **CA-2:** *Dado* `style = hype`, *então* o tom é visivelmente mais exagerado que em `classic`.
- **CA-3:** *Dado* que o Gemini lança erro, *quando* o fluxo executa, *então* `fallbackScript` fornece um roteiro válido e o pipeline segue.
- **CA-4:** *Dado* o script de teste isolado (roadmap 1.2), *então* imprime um roteiro coerente no console para um clipe fixo.

## Fora de escopo

- Precisão factual (placar, nomes, tempo).
- Múltiplos idiomas.

## Dependências

- SDKs e chave `GEMINI_API_KEY` ([`environment.md`](../definitions/environment.md)).
- Consumido por [SPEC-004](./SPEC-004-api-narrate.md); alimenta [SPEC-003](./SPEC-003-text-to-speech.md).
