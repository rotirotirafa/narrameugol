# NarraMeuGol — Project Brief (for Claude Code)

> Project name: **NarraMeuGol** (repo/handle: `narrameugol`; "AI" lives in the tagline: *"a IA que narra seu gol de várzea"*). This file is the build spec — read it before scaffolding.
> Context: entry for the DEV Weekend Challenge (Passion Edition). Must be a **brand-new repo**, all commits inside the challenge window.

## What we're building

A single-page web app: the user **uploads a short clip** of an amateur football game, an AI **watches the video** and writes a hyped Brazilian radio-style commentary script, another AI **turns it into audio**, and the app **plays the narration over the (muted) video** and lets the user download the audio.

Flow: `upload clip + style → Gemini (video → script) → ElevenLabs (script → mp3) → play video muted + audio synced + download`.

The app UI and the narration are in **Brazilian Portuguese**. Not a match report — it's hype, so exact names/timestamps don't matter.

## Stack

- **Next.js (App Router) + TypeScript + React**
- **Tailwind CSS**
- Deploy target: **Vercel**
- **Gemini** via `@google/genai` (video understanding + script generation)
- **ElevenLabs** via `@elevenlabs/elevenlabs-js` (text-to-speech)

## Architecture

Both API keys stay **server-side only**. The single API route orchestrates both AI calls.

```
[ Browser / React ]
  video upload + commentator style
       │  POST /api/narrate  (multipart: video, style)
       ▼
[ /api/narrate  (Next.js route handler, server) ]
  1. validate the upload
  2. Gemini: watch the clip → write the broadcaster script
     └─ fallback: if Gemini fails, use a generic hype template
  3. ElevenLabs: script → mp3
  4. return { script, audioBase64, mime }
       │
       ▼
[ Browser ]  <video muted> + <audio> play together  +  download mp3
```

## File structure

```
/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx                 # single screen: upload + player
│  ├─ globals.css
│  └─ api/narrate/route.ts     # POST handler: orchestrates Gemini + ElevenLabs
├─ components/
│  ├─ VideoUpload.tsx          # file input / dropzone
│  ├─ StyleSelector.tsx        # commentator style: 'classic' | 'hype'
│  └─ NarrationPlayer.tsx      # muted video + synced audio + download + script
├─ lib/
│  ├─ types.ts                 # shared types
│  ├─ gemini.ts                # upload video + prompt → script
│  ├─ elevenlabs.ts            # script → mp3
│  └─ scriptFallback.ts        # generic hype script (safety net)
├─ .env.local                  # real keys — gitignored
├─ .env.example                # variable names only — committed
└─ README.md
```

## API contract

`POST /api/narrate` — `multipart/form-data` with `video` (file) and `style` (`classic` | `hype`).

- **200:** `{ script: string, audioBase64: string, mime: "audio/mpeg" }`
- **Errors:** `400` no/invalid video, `413` too large, `502` Gemini/ElevenLabs failure, `500` unexpected.

## Integrations (concrete details)

### Gemini (`lib/gemini.ts`)
- SDK: `@google/genai`, class `GoogleGenAI`, method `ai.models.generateContent()`.
- Model: **`gemini-2.5-flash`** (cheap/fast). Only bump to `gemini-2.5-pro` if video reading is weak.
- Send the video (use the **File API** for clips; inline is fine only for very small files).
- Prompt (PT-BR broadcaster), roughly:
  > "Assista a este lance de futebol amador (várzea). Descreva mentalmente a sequência da jogada e escreva um roteiro CURTO (~100 palavras) de locutor de rádio brasileiro empolgado, com bordões e marcações expressivas (ex.: GOOOL, reticências para suspense). NÃO invente nomes de jogadores nem minutos. Responda apenas com o roteiro, em português."
- Vary tone by `style` (`classic` = measured radio; `hype` = over-the-top).

### ElevenLabs (`lib/elevenlabs.ts`)
- SDK: `@elevenlabs/elevenlabs-js`, `ElevenLabsClient` initialized with the API key.
- Model: **Eleven v3** (most expressive; supports PT-BR). Flash v2.5 as a lower-latency fallback.
- Use a Brazilian-Portuguese broadcaster voice (store its id in `ELEVENLABS_VOICE_ID`).
- Return audio and convert to base64 for the JSON response.

### Player sync (`NarrationPlayer.tsx`)
- Render `<video muted>` + `<audio>`; call `play()` on both together. No frame-perfect sync needed (it's a voiceover).

## Environment variables

```
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
```
Put real values in `.env.local` (gitignored). Commit `.env.example` with the names only. Add all three in the Vercel dashboard.

## MVP scope (do this first)

Upload → Gemini script → ElevenLabs audio → play video+audio synced → download mp3. One screen. **No auth, no database, no history.**

## Stretch (only if time remains)

Burn the narration into the video (server-side ffmpeg) to produce a single downloadable file.

## Build order

1. `create-next-app` (TS + Tailwind), init git, **first commit now**.
2. Isolated test: upload a sample clip → Gemini returns a script. Confirm it works.
3. `/api/narrate`: Gemini → ElevenLabs → JSON. Test with a fixed clip before building UI.
4. Frontend: upload, call API, player (muted video + synced audio + download).
5. Polish: 2 styles, loading/error states, responsive, football-themed look.
6. Deploy to Vercel, test in prod with real clips.

## Guardrails

- Keys **never** in client code — only in the route handler / env vars.
- Always wire the Gemini → template fallback so a live demo can't fully break.
- Keep clips short (~≤1 min) for cost/latency.
- Credit any non-trivial open-source code used.