# Architecture Decision Records (ADRs)

Decisões com trade-off, com o contexto que as justifica. Formato enxuto: contexto → decisão → consequência. A maioria deriva diretamente do [`BRIEF.md`](../../BRIEF.md).

---

## ADR-0001 — Next.js App Router

**Contexto:** app single-page com uma rota de servidor para orquestrar IA; alvo de deploy é a Vercel.
**Decisão:** Next.js (App Router) + TypeScript + React + Tailwind.
**Consequência:** route handler e UI no mesmo projeto; deploy nativo na Vercel; um só toolchain. Server components/handlers mantêm segredos fora do bundle do cliente.

---

## ADR-0002 — Um único route handler orquestrador

**Contexto:** o fluxo tem dois passos de IA encadeados (vídeo→roteiro→áudio).
**Decisão:** um único endpoint `POST /api/narrate` executa as duas chamadas em sequência e devolve o resultado combinado.
**Consequência:** cliente faz **uma** requisição; menos idas e voltas; lógica de orquestração e fallback num lugar só. Contrapartida: requisição mais longa (duas chamadas de IA em série) — mitigada mantendo clipes curtos.

---

## ADR-0003 — Chaves de API somente no servidor

**Contexto:** `GEMINI_API_KEY`, `ELEVENLABS_API_KEY` e `ELEVENLABS_VOICE_ID` são segredos.
**Decisão:** as chaves só existem no route handler / variáveis de ambiente. Nunca em código de cliente nem em variáveis `NEXT_PUBLIC_*`.
**Consequência:** todas as chamadas de IA passam pelo servidor. `.env.local` (gitignored) local; as três variáveis no dashboard da Vercel em produção; `.env.example` só com os nomes.

---

## ADR-0004 — Fallback de roteiro quando o Gemini falha

**Contexto:** é uma demo ao vivo; a leitura de vídeo é a parte mais frágil.
**Decisão:** se o Gemini falhar (erro, timeout, resposta vazia), usar `lib/scriptFallback.ts` — um roteiro hype genérico parametrizado pelo `style` — e continuar para o TTS.
**Consequência:** a demo nunca fica sem áudio por causa do Gemini. O roteiro pode ser genérico nesses casos, o que é aceitável (é hype, não relatório). Só a falha do ElevenLabs resulta em erro visível (`502`).

---

## ADR-0005 — Áudio como base64 no JSON

**Contexto:** o cliente precisa do mp3 para tocar e baixar.
**Decisão:** o route handler retorna o áudio como string base64 dentro do JSON (`{ audioBase64, mime }`), em vez de um binário/stream separado.
**Consequência:** integração trivial no cliente (montar um `data:`/Blob URL). Contrapartida: base64 infla ~33% e o payload pode encostar nos limites da função serverless — por isso a restrição de clipes curtos e a tarefa de revisar limites no deploy (roadmap 5.4). Reavaliar streaming/binário se o tamanho virar problema.

---

## ADR-0006 — Sincronia de player "boa o suficiente"

**Contexto:** é uma narração por cima do vídeo; não é dublagem lábio-sincronizada.
**Decisão:** renderizar `<video muted>` + `<audio>` e chamar `play()` nos dois juntos, sem sincronização frame a frame.
**Consequência:** implementação simples. Pequenos desvios são aceitáveis. Necessário tratar autoplay bloqueado pelo navegador disparando o `play()` a partir de um gesto do usuário.

---

## ADR-0007 — Sem estado, sem persistência (MVP)

**Contexto:** escopo de MVP é uma tela sem contas.
**Decisão:** nada de banco, sessão ou histórico; cada requisição é independente e efêmera.
**Consequência:** arquitetura mínima e rápida de construir. Recarregar a página perde o resultado. Persistência/histórico ficam explicitamente fora do MVP.
