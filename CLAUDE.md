# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read the brief first

`BRIEF.md` is the authoritative build spec for **NarraMeuGol** — read it before scaffolding or changing architecture. It carries the exact SDKs, models, prompt text, API contract, and build order. This file is the operational summary; when the two disagree, `BRIEF.md` wins.

## Documentation (`docs/`, PT-BR, SDD)

Refined, spec-driven docs live in [`docs/`](./docs/README.md) — start at its README. Key entry points:
- [`docs/roadmap.md`](./docs/roadmap.md) — the full work breakdown (epics → tasks → DoD). Update task status here as work progresses.
- [`docs/specs/`](./docs/specs/README.md) — one spec per capability (upload, script, TTS, API, player), each with testable acceptance criteria. Update the spec before changing behavior.
- [`docs/architecture/`](./docs/architecture/overview.md) — overview, data flow, and ADRs (the "why").
- [`docs/definitions/`](./docs/definitions/api-contract.md) — API contract, env vars, glossary.

Precedence: `BRIEF.md` > `docs/` > `CLAUDE.md`.

## Current state

Scaffolded and working: **Next.js 16 + React 19 + Tailwind v4** (App Router). The MVP is built and verified (build + lint green): upload → Gemini script → ElevenLabs mp3 → synced player → downloads. Beyond the original brief it also has a **PT-BR / EN language toggle** (switches the UI *and* the narration) and a **share panel** (download the mp3, the muted clip, or a one-click narrated mp4 muxed in-browser with ffmpeg.wasm). This is a DEV Weekend Challenge entry — keep **all commits inside the challenge window**, and prefer small, logical commits.

## Commands

```bash
npm install
npm run dev      # local dev server (http://localhost:3000)
npm run build    # production build (Turbopack) — run before deploying
npm run lint     # eslint
npm start        # serve the production build
```

No unit-test framework is set up. Runtime verification is manual: run the app, or drive it with the Playwright MCP (used to verify the ffmpeg burn-in end to end). Keys live in `.env.local` / `.env` (see below); the build compiles without them.

## Architecture

A one-screen web app that narrates amateur football clips. UI and narration are **Brazilian Portuguese**; the output is hype, not an accurate match report (names/timestamps deliberately don't matter).

Data flow — a **single** API route orchestrates both AI calls server-side:

```
Browser: upload video + style + language ──POST /api/narrate (multipart)──▶
  /api/narrate (route handler, runtime=nodejs):
    1. validate upload (400/413); coerce style + language
    2. Gemini (@google/genai, gemini-2.5-flash): video → broadcaster script in the
       chosen language └─ fallback to lib/scriptFallback.ts if Gemini fails (still 200)
    3. ElevenLabs (@elevenlabs/elevenlabs-js, eleven_multilingual_v2): script → mp3
       (502 on failure)
    4. return { script, audioBase64, mime: "audio/mpeg" }
  ◀── Browser: <video muted> + <audio> play together; download mp3 / clip; or mux a
      single narrated mp4 in-browser via ffmpeg.wasm (lib/burnIn.ts)
```

`POST /api/narrate` — multipart `video`, `style` (`classic`|`hype`), `language` (`pt-BR`|`en`). Responses: `200 {script, audioBase64, mime}`; errors `400`/`413`/`502`/`500` with a localized `{error}`.

Layout: `app/` (page + `api/narrate/route.ts`), `components/` (`VideoUpload`, `StyleSelector`, `NarrationPlayer`, `LanguageProvider`), `lib/` (`types`, `config`, `i18n`, `gemini`, `elevenlabs`, `scriptFallback`, `burnIn`).

**i18n:** `lib/i18n.ts` is the single source of truth for every UI string (typed `Messages`, PT-BR + EN) plus localized API errors; `components/LanguageProvider.tsx` holds the language context, `useI18n()`, and the toggle. The selected language is sent to `/api/narrate` so the narration is generated in that language.

## Non-obvious constraints

- **Both API keys are server-side only** — `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` live in the route handler / env, **never** in client code. Keep real values in gitignored `.env.local` (or `.env`); commit `.env.example` (names only); set all three in the Vercel dashboard. SDK clients are created lazily, so the build never needs keys.
- **Always wire the Gemini → `scriptFallback` path** so a live demo can't fully break; only an ElevenLabs failure surfaces to the user (502).
- **Model / voice gotchas** (all in `lib/config.ts`): ElevenLabs defaults to `eleven_multilingual_v2` (available on all plans, good PT-BR); `eleven_v3` has restricted API access. `ELEVENLABS_VOICE_ID` must be a voice the account's plan can use — premium/library voices reject on free tier (`free_users_not_allowed`).
- Gemini uses the **Files API** (upload + poll until ACTIVE); keep clips short (~≤1 min) and within `MAX_VIDEO_BYTES` (20 MB) — mind Vercel's serverless payload/timeout limits.
- The `style` param (`classic` | `hype`) only varies prompt tone. Player sync is intentionally loose (`<video muted>` + `<audio>`, `play()` together — it's a voiceover).
- The **narrated mp4** (`lib/burnIn.ts`) muxes client-side with ffmpeg.wasm (single-threaded core from CDN, so no COOP/COEP headers). It uses `-c:v copy` (works for h264/mp4 phone clips) and **falls back to the manual download+edit path** on any failure — the app never depends on it.
- No auth, no database, no history. The original server-side-ffmpeg burn-in stretch goal is instead done **client-side**.
