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

The repo is **not yet scaffolded** — only `BRIEF.md` exists, no commits, no `package.json`. The first task is usually to bootstrap the Next.js app. This is a DEV Weekend Challenge entry: it must be a brand-new repo with **all commits inside the challenge window**, so make an initial commit immediately after scaffolding.

## Commands

Once scaffolded (Next.js App Router + TypeScript + Tailwind):

```bash
npx create-next-app@latest . --ts --tailwind --app   # bootstrap (one-time)
npm run dev      # local dev server
npm run build    # production build (run before deploying)
npm run lint     # eslint
npm start        # serve the production build
```

No test framework is chosen yet — don't assume one exists.

## Architecture

A one-screen web app that narrates amateur football clips. UI and narration are **Brazilian Portuguese**; the output is hype, not an accurate match report (names/timestamps deliberately don't matter).

Data flow — a **single** API route orchestrates both AI calls server-side:

```
Browser: upload video + style ──POST /api/narrate (multipart)──▶
  /api/narrate (route handler):
    1. validate upload
    2. Gemini (@google/genai, gemini-2.5-flash): video → PT-BR broadcaster script
       └─ fallback to lib/scriptFallback.ts template if Gemini fails
    3. ElevenLabs (@elevenlabs/elevenlabs-js, Eleven v3): script → mp3
    4. return { script, audioBase64, mime: "audio/mpeg" }
  ◀── Browser: <video muted> + <audio> play together + download mp3
```

`POST /api/narrate` responses: `200 {script, audioBase64, mime}`; errors `400` (no/invalid video), `413` (too large), `502` (Gemini/ElevenLabs failure), `500` (unexpected).

Intended layout: `app/` (page + `api/narrate/route.ts`), `components/` (`VideoUpload`, `StyleSelector`, `NarrationPlayer`), `lib/` (`types`, `gemini`, `elevenlabs`, `scriptFallback`). See `BRIEF.md` for the full tree.

## Non-obvious constraints

- **Both API keys are server-side only** — `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` live in the route handler / env, **never** in client code. Commit `.env.example` (names only); keep real values in gitignored `.env.local`; also set all three in the Vercel dashboard.
- **Always wire the Gemini → `scriptFallback` template path** so a live demo can't fully break if Gemini fails.
- Gemini uploads should use the **File API** for clips (inline only for very small files); keep clips short (~≤1 min) for cost/latency.
- Player sync is intentionally loose: `<video muted>` + `<audio>`, `play()` both together — it's a voiceover, no frame-perfect sync.
- The `style` param (`classic` | `hype`) only varies prompt tone: `classic` = measured radio, `hype` = over-the-top.
- MVP scope is **no auth, no database, no history**. Burning narration into the video via server-side ffmpeg is a stretch goal only.
