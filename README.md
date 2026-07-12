# NarraMeuGol ⚽

> **the AI that calls your street-football goal**
> *(PT-BR: "a IA que narra seu gol de várzea")*

Upload a short clip of an amateur football match and an AI **watches the video**, writes a hyped Brazilian radio-style commentary, and **turns it into audio** — playing the narration over your (muted) clip, ready to download and post.

Built for the **DEV Weekend Challenge (Passion Edition)**. *Várzea* is Brazilian pickup/park football — the whole point is passion and hype, not an accurate match report.

## What it does

```
upload clip + style + language → Gemini (video → script) → ElevenLabs (script → mp3)
→ play muted video + synced narration → download mp3 / clip / one-click narrated mp4
```

- **Bilingual (PT-BR / EN):** one toggle switches the entire UI **and** the narration language (the wordmark flips too: NARRA·MEU·GOL ↔ NARRATE·MY·GOAL). Non-Portuguese browsers start in English.
- **Two commentator styles:** `classic` (measured radio) and `hype` (over-the-top).
- **Share it:** download the narration mp3, the muted clip, or a **single narrated mp4** muxed **entirely in your browser** (ffmpeg.wasm) — ready for Instagram/YouTube, no server round-trip.
- **Never fully breaks:** if Gemini can't read the clip, a template script keeps the demo alive.

A single server route holds both API keys and orchestrates both AI calls; the browser never sees a key.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS v4**
- **Gemini** via `@google/genai` (video understanding + script)
- **ElevenLabs** via `@elevenlabs/elevenlabs-js` (text-to-speech, `eleven_multilingual_v2`)
- **ffmpeg.wasm** (`@ffmpeg/ffmpeg`) for the in-browser narrated mp4
- Deploy target: **Vercel**

## Run it locally

**Prerequisites:** Node.js 20.9+ (22 LTS recommended) and npm.

```bash
npm install

# add your keys (nothing here is committed)
cp .env.example .env.local
#   GEMINI_API_KEY=...
#   ELEVENLABS_API_KEY=...
#   ELEVENLABS_VOICE_ID=...   (a voice your plan can use — see below)

npm run dev        # http://localhost:3000
```

Other commands: `npm run build` (production), `npm start` (serve the build), `npm run lint`.

> Without keys the UI loads and upload validation works, but generating a narration returns an error — the Gemini/ElevenLabs calls need the env vars. In production, set all three in the Vercel dashboard.

## Environment variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key. |
| `ELEVENLABS_API_KEY` | ElevenLabs API key. |
| `ELEVENLABS_VOICE_ID` | A voice **your plan can use**. Premade voices work on the free tier; some library/premium voices require the Creator tier or above. Copy a Voice ID from the ElevenLabs dashboard — `.env.example` lists a few free premade examples. |

## Project structure

```
app/
  layout.tsx                 # PT-BR/EN <html lang>, fonts, theme
  page.tsx                   # single screen: upload → player (LanguageProvider)
  globals.css                # várzea theme (Tailwind v4)
  api/narrate/route.ts       # POST: validate → Gemini (+fallback) → ElevenLabs
components/
  VideoUpload.tsx            # dropzone + validation
  StyleSelector.tsx          # commentator style: classic | hype
  NarrationPlayer.tsx        # muted video + audio + script + downloads (mp3/clip/mp4)
  LanguageProvider.tsx       # i18n context, useI18n(), PT/EN toggle
lib/
  types.ts  config.ts        # shared contract + constants (models, limits)
  i18n.ts                    # typed PT-BR + EN message dictionary
  gemini.ts elevenlabs.ts scriptFallback.ts
  burnIn.ts                  # in-browser mp4 mux (ffmpeg.wasm)
```

## Documentation

Design docs (architecture, SDD specs, API contract, decisions) live in [`docs/`](./docs/README.md) — in Brazilian Portuguese. Progress and the work breakdown are in [`docs/roadmap.md`](./docs/roadmap.md).

## Scope

One screen, no auth, no database, no history. The "burn the narration into the video" stretch goal is done **client-side** (ffmpeg.wasm), so nothing extra runs on the server.
