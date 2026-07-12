# Roadmap & Refinamento — NarraMeuGol

Refinamento de **tudo que precisa ser desenvolvido** até o projeto estar pronto para a demo. Organizado em épicos na ordem sugerida de execução (espelha o "Build order" do [`BRIEF.md`](../BRIEF.md)). Cada tarefa aponta para a spec que a governa.

**Legenda de status:** ⬜ a fazer · 🟨 em andamento · ✅ concluído
**Tamanho:** P (≤1h) · M (algumas horas) · G (meio dia+)

---

## Progresso (2026-07-12)

MVP **construído e verificado**: `npm run build` e `npm run lint` verdes; o fluxo completo, o toggle de idioma e o **vídeo narrado (ffmpeg.wasm)** foram testados em navegador real (Playwright — mp4 gerado e baixado). Esta seção é a fonte da verdade do estado atual — as tabelas abaixo permanecem como o plano original.

- ✅ **Épico 0 — Bootstrap** — Next 16 + React 19 + Tailwind v4, SDKs, `lib/types.ts` / `lib/config.ts`, `.env.example`.
- ✅ **Épico 1 — Libs de IA** — `lib/gemini.ts`, `lib/elevenlabs.ts`, `lib/scriptFallback.ts` (agora cientes do idioma).
- ✅ **Épico 2 — Rota `/api/narrate`** — validação 400/413, fallback do Gemini, 502 de TTS, sucesso `{ script, audioBase64, mime }`, erros localizados.
- ✅ **Épico 3 — Frontend** — `VideoUpload`, `StyleSelector`, `NarrationPlayer`, `page.tsx` (idle/loading/done/error), tema várzea.
- 🟨 **Épico 4 — Polish** — loading/erro, responsivo, tema e diferenciação de tom feitos; falta o aviso de duração do clipe (4.5).
- ⬜ **Épico 5 — Deploy** — pendente: preencher chaves na Vercel, testar em produção, revisar limites serverless (payload/timeout).
- ✅ **Épico 6 — Stretch (burn-in)** — feito **no cliente** (ffmpeg.wasm), não no servidor: botão "vídeo narrado (mp4)" que faz o mux no navegador, com fallback pro caminho manual.

**Extras além do brief original:**
- ✅ **i18n PT-BR / EN** — toggle que troca UI + narração + erros da API + wordmark (`lib/i18n.ts`, `components/LanguageProvider.tsx`).
- ✅ **Compartilhamento** — download do mp3, do clipe (mudo) e do mp4 narrado; dicas de edição (CapCut/InShot/Reels).

**Pendências / riscos de runtime** (só verificáveis com chaves reais): validar o pipeline Gemini → ElevenLabs ponta a ponta (o caminho do mp4 já foi validado com clipe sintético); a voz do ElevenLabs precisa estar disponível no plano da conta; e o teto de 20 MB + `maxDuration = 60` precisa ser conferido contra os limites reais da Vercel. Model IDs ficam em `lib/config.ts` (ElevenLabs já em `eleven_multilingual_v2`).

---

## Épico 0 — Bootstrap do projeto

Objetivo: repositório executável, com tooling e segredos configurados. Todos os commits dentro da janela do desafio.

| # | Tarefa | Tam | Status |
|---|--------|-----|--------|
| 0.1 | `create-next-app` (TypeScript + Tailwind + App Router) na raiz | P | ⬜ |
| 0.2 | Primeiro commit imediatamente após o scaffold | P | ⬜ |
| 0.3 | `.env.example` com os 3 nomes de variáveis; garantir `.env.local` no `.gitignore` | P | ⬜ |
| 0.4 | Instalar SDKs: `@google/genai`, `@elevenlabs/elevenlabs-js` | P | ⬜ |
| 0.5 | Estrutura de pastas conforme brief (`app/`, `components/`, `lib/`) | P | ⬜ |
| 0.6 | Definir tipos compartilhados em `lib/types.ts` (ver [SPEC-004](./specs/SPEC-004-api-narrate.md)) | P | ⬜ |

**Definition of Done:** `npm run dev` sobe uma página em branco; `npm run build` e `npm run lint` passam; `.env.example` commitado; segredos reais só em `.env.local`.

---

## Épico 1 — Spikes de integração de IA (isolados)

Objetivo: provar cada integração de IA isoladamente **antes** de montar a orquestração. Reduz risco cedo.

| # | Tarefa | Spec | Tam | Status |
|---|--------|------|-----|--------|
| 1.1 | `lib/gemini.ts`: enviar clipe via File API + prompt → roteiro PT-BR | [SPEC-002](./specs/SPEC-002-script-generation.md) | M | ⬜ |
| 1.2 | Script de teste isolado: clipe fixo → roteiro no console | [SPEC-002](./specs/SPEC-002-script-generation.md) | P | ⬜ |
| 1.3 | `lib/scriptFallback.ts`: template de roteiro hype genérico | [SPEC-002](./specs/SPEC-002-script-generation.md) | P | ⬜ |
| 1.4 | `lib/elevenlabs.ts`: roteiro → mp3 (Buffer) | [SPEC-003](./specs/SPEC-003-text-to-speech.md) | M | ⬜ |
| 1.5 | Teste isolado: roteiro fixo → mp3 salvo em disco, escutável | [SPEC-003](./specs/SPEC-003-text-to-speech.md) | P | ⬜ |
| 1.6 | **Confirmar model IDs** de Gemini e ElevenLabs contra os docs atuais dos provedores | — | P | ⬜ |

**Definition of Done:** rodando os dois scripts isolados, um clipe vira roteiro coerente em PT-BR e um roteiro vira um mp3 audível. Fallback gera roteiro válido sem chamar a rede.

---

## Épico 2 — Rota de orquestração `/api/narrate`

Objetivo: um único route handler que valida, chama Gemini (com fallback) e ElevenLabs, e devolve JSON.

| # | Tarefa | Spec | Tam | Status |
|---|--------|------|-----|--------|
| 2.1 | Route handler `app/api/narrate/route.ts` (POST, multipart) | [SPEC-004](./specs/SPEC-004-api-narrate.md) | M | ⬜ |
| 2.2 | Validação do upload: presença, mime de vídeo, tamanho → `400`/`413` | [SPEC-001](./specs/SPEC-001-video-upload.md) | M | ⬜ |
| 2.3 | Orquestração Gemini → (fallback) → ElevenLabs | [SPEC-004](./specs/SPEC-004-api-narrate.md) | M | ⬜ |
| 2.4 | Converter áudio para base64 e montar resposta `200` | [SPEC-004](./specs/SPEC-004-api-narrate.md) | P | ⬜ |
| 2.5 | Mapeamento de erros: `400/413/502/500` conforme contrato | [`api-contract.md`](./definitions/api-contract.md) | P | ⬜ |
| 2.6 | Teste com clipe fixo via `curl`/Thunder antes de haver UI | [SPEC-004](./specs/SPEC-004-api-narrate.md) | P | ⬜ |

**Definition of Done:** `POST /api/narrate` com um clipe real retorna `{ script, audioBase64, mime }`; forçar falha do Gemini ainda retorna `200` (via fallback); uploads inválidos retornam o código correto.

---

## Épico 3 — Frontend (tela única)

Objetivo: a experiência completa no navegador.

| # | Tarefa | Spec | Tam | Status |
|---|--------|------|-----|--------|
| 3.1 | `components/VideoUpload.tsx`: input/dropzone + validação client-side | [SPEC-001](./specs/SPEC-001-video-upload.md) | M | ⬜ |
| 3.2 | `components/StyleSelector.tsx`: `classic` \| `hype` | [SPEC-002](./specs/SPEC-002-script-generation.md) | P | ⬜ |
| 3.3 | `app/page.tsx`: estado da tela, chamada a `/api/narrate`, orquestração de UI | [SPEC-005](./specs/SPEC-005-narration-playback.md) | M | ⬜ |
| 3.4 | `components/NarrationPlayer.tsx`: `<video muted>` + `<audio>` tocando juntos | [SPEC-005](./specs/SPEC-005-narration-playback.md) | M | ⬜ |
| 3.5 | Exibir o roteiro em texto | [SPEC-005](./specs/SPEC-005-narration-playback.md) | P | ⬜ |
| 3.6 | Botão de download do mp3 | [SPEC-005](./specs/SPEC-005-narration-playback.md) | P | ⬜ |

**Definition of Done:** do upload ao download num fluxo só; vídeo mudo e áudio começam juntos; roteiro visível; mp3 baixável.

---

## Épico 4 — Polish

Objetivo: deixar apresentável e resiliente.

| # | Tarefa | Tam | Status |
|---|--------|-----|--------|
| 4.1 | Estados de loading (durante a geração) e de erro (mensagens PT-BR) | M | ⬜ |
| 4.2 | Layout responsivo (mobile-first) | M | ⬜ |
| 4.3 | Identidade visual com tema de futebol/várzea | M | ⬜ |
| 4.4 | Diferenciação real de tom entre `classic` e `hype` | P | ⬜ |
| 4.5 | Limites de UX: aviso de duração/tamanho de clipe antes de enviar | P | ⬜ |

**Definition of Done:** nenhum estado "morto" (sempre há loading/erro/resultado); usável no celular; visualmente coerente com o tema.

---

## Épico 5 — Deploy

| # | Tarefa | Tam | Status |
|---|--------|-----|--------|
| 5.1 | Configurar as 3 variáveis de ambiente no dashboard da Vercel | P | ⬜ |
| 5.2 | Deploy de produção | P | ⬜ |
| 5.3 | Testar em produção com clipes reais (incluindo caminho de fallback) | M | ⬜ |
| 5.4 | Revisar limites de payload/timeout de função serverless para vídeo+áudio | M | ⬜ |

**Definition of Done:** URL pública funcionando com clipes reais; fallback verificado em produção.

---

## Épico 6 — Stretch: burn-in do áudio no vídeo

Só se sobrar tempo. Queimar a narração dentro do vídeo (ffmpeg server-side) para um único arquivo baixável.

| # | Tarefa | Tam | Status |
|---|--------|-----|--------|
| 6.1 | Avaliar ffmpeg em ambiente serverless da Vercel (limites/tempo) | M | ⬜ |
| 6.2 | Mux do mp3 sobre o vídeo mudo → arquivo único | G | ⬜ |
| 6.3 | Opção de download do vídeo narrado | P | ⬜ |

---

## Riscos & questões abertas

- **Limites da função serverless (Vercel):** vídeo de entrada + áudio base64 podem estourar payload/tempo. Ver Épico 5.4 e [ADR-0005](./architecture/decisions.md#adr-0005--áudio-como-base64-no-json).
- **Model IDs:** confirmar `gemini-2.5-flash` e "Eleven v3" contra a documentação atual dos provedores antes de implementar (tarefa 1.6).
- **Custo/latência:** manter clipes curtos (~≤1 min); só subir para `gemini-2.5-pro` se a leitura de vídeo ficar fraca.
- **Sincronia do player:** aceitável não ser frame-perfect (é voiceover); ainda assim tratar autoplay bloqueado pelo navegador.
- **Voz PT-BR:** garantir um `ELEVENLABS_VOICE_ID` de locutor brasileiro convincente.
