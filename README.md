# NarraMeuGol ⚽

> **a IA que narra seu gol de várzea**

Suba um clipe curto de um jogo de futebol amador, e a IA assiste ao lance, escreve uma narração no estilo locutor de rádio brasileiro e transforma em áudio — tocando por cima do seu vídeo (mudo), pronto pra baixar e compartilhar.

Entrada para o **DEV Weekend Challenge (Passion Edition)**.

## Como funciona

```
upload do clipe + estilo → Gemini (vídeo → roteiro) → ElevenLabs (roteiro → mp3)
→ tocar vídeo mudo + áudio sincronizado + baixar mp3
```

Uma única rota de servidor (`/api/narrate`) orquestra as duas IAs; as chaves ficam **somente no servidor**. Se o Gemini falhar, um roteiro genérico (fallback) entra no lugar — a demo nunca quebra por completo.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4**
- **Gemini** via `@google/genai` (compreensão de vídeo + roteiro)
- **ElevenLabs** via `@elevenlabs/elevenlabs-js` (text-to-speech)
- Deploy: **Vercel**

## Rodando localmente

**Pré-requisitos:** Node.js 20.9+ (recomendado 22 LTS) e npm.

```bash
npm install

# configure as chaves (nenhuma delas vai pro git)
cp .env.example .env.local
#   GEMINI_API_KEY=...
#   ELEVENLABS_API_KEY=...
#   ELEVENLABS_VOICE_ID=...   (voz de locutor PT-BR)

npm run dev        # http://localhost:3000
```

Outros comandos: `npm run build` (produção), `npm start` (servir o build), `npm run lint`.

> Sem as chaves, a interface abre e a validação de upload funciona, mas a geração de narração retorna erro — as chamadas ao Gemini/ElevenLabs precisam das variáveis em `.env.local`. Em produção, configure as três no dashboard da Vercel.

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `GEMINI_API_KEY` | Chave da API do Google Gemini. |
| `ELEVENLABS_API_KEY` | Chave da API do ElevenLabs. |
| `ELEVENLABS_VOICE_ID` | Id de uma voz de locutor em português do Brasil. |

## Documentação

A documentação viva (arquitetura, specs SDD, contrato da API, decisões) está em [`docs/`](./docs/README.md). O plano de trabalho e o estado atual ficam em [`docs/roadmap.md`](./docs/roadmap.md).

## Estrutura

```
app/
  layout.tsx                 # metadados PT-BR + fontes + tema
  page.tsx                   # tela única: upload → player
  globals.css                # tema várzea (Tailwind v4)
  api/narrate/route.ts       # POST: orquestra Gemini + ElevenLabs
components/
  VideoUpload.tsx            # dropzone + validação
  StyleSelector.tsx          # estilo do locutor: classic | hype
  NarrationPlayer.tsx        # vídeo mudo + áudio + download + roteiro
lib/
  types.ts  config.ts        # contrato e constantes compartilhados
  gemini.ts elevenlabs.ts scriptFallback.ts
```

## Escopo

MVP: upload → roteiro → áudio → tocar sincronizado → baixar. Uma tela, sem login, sem banco, sem histórico. Tudo em português do Brasil.
