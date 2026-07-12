# NarraMeuGol ⚽ — the AI that calls your street-football goal

*Submitted for the DEV Weekend Challenge — Passion Edition.*

## What I built

**NarraMeuGol** turns a phone clip of an amateur (*"várzea"*) football match into a
hyped Brazilian **radio-style commentary** — written and voiced by AI, played over
your video, and exportable as a single ready-to-post `.mp4`.

*Várzea* is Brazilian pickup football: dirt fields, street corners, pure passion —
no cameras, no commentators. This app gives every backyard goal the epic radio call
it deserves. It's not a match report; it's **hype**.

## 🔗 Live demo & code

- **Live:** https://narrameugol.vercel.app
- **Repo:** https://github.com/rotirotirafa/narrameugol

## How it works

```
upload a clip + pick a style → Gemini watches the video and writes the script
→ ElevenLabs turns it into a broadcaster voice → the app plays the narration over
your (muted) clip → download the mp3, the clip, or a single narrated mp4
```

One server route holds both API keys and orchestrates both AI calls — the browser
never sees a secret.

## Features I'm proud of

- 🎙️ **Watches the video, then calls the play.** Gemini reads the clip and writes
  ~100 words of over-the-top radio commentary, with Brazilian *bordões*
  (catchphrases) and drawn-out "GOOOOL"s.
- 🌎 **Fully bilingual (PT-BR / EN).** One toggle switches the entire UI *and* the
  narration language — the wordmark even flips: **NARRA·MEU·GOL ↔ NARRATE·MY·GOAL**.
- 🎬 **One-click narrated mp4, in your browser.** ffmpeg.wasm muxes the clip +
  narration into a single video to post to Instagram/TikTok — no server, no re-upload.
- 🛟 **A demo that never fully breaks.** If the vision model can't read the clip, a
  template script keeps the narration going, so a live demo can't go silent.
- 🎨 **A look with intent.** A "night match" theme — pitch green, *canarinho* gold,
  chalk field-lines and an "ON AIR" pulse — built to feel like street-football radio,
  not a template.

## Tech stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind v4**
- **Gemini** (`@google/genai`) — video understanding + script generation
- **ElevenLabs** (`@elevenlabs/elevenlabs-js`, `eleven_multilingual_v2`) — text-to-speech
- **ffmpeg.wasm** — in-browser video muxing
- Deployed on **Vercel**

## Engineering notes

- **Keys stay server-side.** A single `/api/narrate` route validates the upload,
  chains Gemini → ElevenLabs, and returns `{ script, audioBase64, mime }`; clients
  never touch a key.
- **The mp4 export runs client-side on purpose.** Beyond skipping a server
  round-trip, it neatly sidesteps Vercel's function body limits — the browser
  already holds both files, so ffmpeg.wasm does the mux right there.
- **Language drives everything.** A typed message dictionary is the single source of
  truth for the UI *and* the AI prompt, so PT/EN never drift apart.

Made on the várzea, with coffee and passion. ⚽
