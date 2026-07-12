*This is a submission for [Weekend Challenge: Passion Edition](https://dev.to/challenges/weekend-2026-07-09)*

## What I Built

**NarraMeuGol** turns a phone clip of an amateur *"várzea"* (Brazilian pickup) football
match into a hyped, **radio-style commentary** — written and voiced by AI, played over
your video, and exportable as a single ready-to-post `.mp4`.

*Várzea* is Brazilian street/park football: dirt fields, no cameras, no commentators —
just passion. My goal was to give every backyard goal the **epic radio call it deserves**.
It's not a match report; it's pure hype.

You upload a clip, pick a commentator style (**classic** or **over-the-top**), choose the
language, and seconds later you're hearing your goal narrated like it's a World Cup final —
Brazilian *bordões* (catchphrases), drawn-out "GOOOOL"s and all.

## Demo

🔗 **Live app:** https://narrameugol.vercel.app

Try it: upload a short clip (≤ 4 MB), pick a style, hit **Generate**. Use the **PT / EN**
toggle in the top corner to switch the whole app *and* the narration language. When it's
done, download the **narrated mp4** to post straight to Instagram/TikTok.

## Code

{% embed https://github.com/rotirotirafa/narrameugol %}

## How I Built It

A single **Next.js 16** (App Router) app. One server route, `/api/narrate`, holds both API
keys and orchestrates the whole pipeline, so the browser never sees a secret:

```
upload → Gemini (video → script) → ElevenLabs (script → voice) → play over muted clip
```

**🟦 Best Use of Google AI — Gemini actually *watches* the clip.**
The uploaded video goes to **Gemini 2.5 Flash** via the Files API (upload → poll until
`ACTIVE`), which reads the play and writes a ~100-word broadcaster script in the chosen
language, with catchphrases and expressive markers — no invented names or scores, just hype.
Multimodal video understanding is what makes the narration about *your* goal.

**🟪 Best Use of ElevenLabs — the voice is the soul of the product.**
That script is sent to **ElevenLabs** (`eleven_multilingual_v2`), which turns it into an
expressive radio-broadcaster voice. The same multilingual voice serves both Portuguese and
English, so one toggle re-narrates the whole thing in another language.

**Other decisions I'm happy with:**

- 🛟 **A demo that can't go silent.** If Gemini can't read the clip, a template script keeps
  the narration flowing — a live demo never fully breaks.
- 🌎 **Real bilingual (PT-BR / EN).** A single typed message dictionary is the source of truth
  for the UI *and* the AI prompt, so the two never drift. The wordmark even flips:
  **NARRA·MEU·GOL ↔ NARRATE·MY·GOAL**.
- 🎬 **One-click narrated mp4 — in the browser.** `ffmpeg.wasm` muxes the muted clip + the
  narration into a single video client-side. Beyond skipping a server round-trip, it neatly
  sidesteps Vercel's function body limits — the browser already has both files.
- 🎨 **A look with intent.** A "night match" theme — pitch green, *canarinho* gold, chalk
  field-lines, an "ON AIR" pulse — built to feel like street-football radio, not a template.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind v4 · Gemini (`@google/genai`) ·
ElevenLabs (`@elevenlabs/elevenlabs-js`) · ffmpeg.wasm · deployed on Vercel.

## Prize Categories

- **Best Use of ElevenLabs** — the entire narration voice is ElevenLabs
  (`eleven_multilingual_v2`), delivering the expressive PT/EN broadcaster audio that *is* the product.
- **Best Use of Google AI** — Gemini's multimodal video understanding watches the clip and
  writes the commentary, so the narration actually reflects the play.

Made on the várzea, with coffee and passion. ⚽
