# Arquitetura — Visão Geral

## Princípio central

Um app **single-page** com **um único route handler** no servidor que orquestra as duas chamadas de IA. As chaves de API vivem **exclusivamente no servidor**. Sem banco, sem auth, sem estado persistente.

## Componentes

```mermaid
flowchart TD
    subgraph Browser [Browser / React]
        U[VideoUpload] --> P[page.tsx<br/>estado da tela]
        S[StyleSelector] --> P
        P --> NP[NarrationPlayer<br/>video mudo + audio + download]
    end

    P -- "POST /api/narrate<br/>multipart: video, style" --> R

    subgraph Server [Next.js Route Handler]
        R[/api/narrate/route.ts]
        R --> G[lib/gemini.ts]
        R --> FB[lib/scriptFallback.ts]
        R --> E[lib/elevenlabs.ts]
    end

    G -- "video -> roteiro" --> GM[(Gemini API)]
    E -- "roteiro -> mp3" --> EL[(ElevenLabs API)]

    R -- "200: script, audioBase64, mime" --> P
```

| Camada | Arquivo(s) | Responsabilidade |
|--------|-----------|------------------|
| UI | `app/page.tsx`, `app/layout.tsx`, `app/globals.css` | Tela única: upload, estilo, player. Orquestra a chamada à API e os estados de loading/erro/resultado. |
| Componentes | `components/VideoUpload.tsx`, `StyleSelector.tsx`, `NarrationPlayer.tsx` | Blocos de UI reutilizáveis e sem lógica de segredo. |
| API | `app/api/narrate/route.ts` | Único ponto server-side: valida, orquestra Gemini→ElevenLabs, mapeia erros. |
| Integrações | `lib/gemini.ts`, `lib/elevenlabs.ts`, `lib/scriptFallback.ts` | Encapsulam cada SDK de IA e o fallback. |
| Tipos | `lib/types.ts` | Contratos compartilhados entre server e client. |

## Fronteiras e regras

- **Cliente nunca vê chaves.** Toda chamada de IA acontece dentro do route handler. O browser só conhece `/api/narrate`. Ver [ADR-0003](./decisions.md#adr-0003--chaves-de-api-somente-no-servidor).
- **Fallback é obrigatório.** Se o Gemini falhar, `scriptFallback.ts` produz um roteiro genérico e o fluxo continua — a demo não pode quebrar por inteiro. Ver [ADR-0004](./decisions.md#adr-0004--fallback-de-roteiro-quando-o-gemini-falha).
- **Sem estado.** Cada requisição é independente; nada é gravado. Recarregar a página zera tudo.
- **PT-BR ponta a ponta:** textos de UI e narração em português do Brasil.

## Stack

- **Next.js (App Router) + TypeScript + React** — ver [ADR-0001](./decisions.md#adr-0001--nextjs-app-router).
- **Tailwind CSS** para estilo.
- **Gemini** via `@google/genai` (`GoogleGenAI` → `ai.models.generateContent()`), modelo `gemini-2.5-flash`.
- **ElevenLabs** via `@elevenlabs/elevenlabs-js` (`ElevenLabsClient`), Eleven v3 (fallback Flash v2.5).
- **Deploy:** Vercel.

> Os IDs de modelo acima vêm do brief e devem ser confirmados contra a documentação atual dos provedores antes de implementar (roadmap 1.6).

## Detalhe do fluxo

Ver [`data-flow.md`](./data-flow.md) para o ciclo de vida completo da requisição, incluindo os caminhos de erro.
