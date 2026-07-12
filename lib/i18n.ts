/**
 * Internationalization dictionary — pure data, safe to import on both the
 * server (route handler, prompts) and the client (UI). No React here; the
 * React context lives in components/LanguageProvider.tsx.
 *
 * The selected language drives BOTH the UI chrome and the narration language.
 */

export type Lang = "pt-BR" | "en";

export const LANGS = ["pt-BR", "en"] as const;

/** Default language (brand identity is Brazilian). Auto-detected on the client. */
export const DEFAULT_LANG: Lang = "pt-BR";

/** Narrows an arbitrary string to a Lang, falling back to the default. */
export function coerceLang(raw: unknown): Lang {
  return typeof raw === "string" && (LANGS as readonly string[]).includes(raw)
    ? (raw as Lang)
    : DEFAULT_LANG;
}

/** All translatable UI strings. Typed so missing/renamed keys fail the build. */
export interface Messages {
  /** Value for the <html lang> attribute. */
  htmlLang: string;
  langToggleAria: string;
  hero: {
    badge: string;
    /** Wordmark split into three parts; the middle is highlighted in gold. */
    wordmark: { pre: string; mid: string; post: string };
    tagline: string;
  };
  controls: {
    styleLegend: string;
    generate: string;
    needVideo: string;
  };
  upload: {
    aria: string;
    prompt: string;
    hint: (mb: number) => string;
    change: string;
    errNotVideo: string;
    errTooLarge: (mb: number) => string;
  };
  style: {
    groupAria: string;
    classic: { title: string; subtitle: string };
    hype: { title: string; subtitle: string };
  };
  player: {
    aria: string;
    play: string;
    playAria: string;
    pause: string;
    pauseAria: string;
    download: string;
    scriptHeading: string;
  };
  share: {
    heading: string;
    tip: string;
    tools: string;
    downloadVideo: string;
    makeVideo: string;
    makingVideo: string;
    makeVideoError: string;
  };
  states: {
    onAir: string;
    warming: string;
    warmingSub: string;
    doneTitle: string;
    doneSub: string;
    reset: string;
    retry: string;
    genericError: string;
    networkError: string;
  };
  footer: string;
  /** Error messages returned by /api/narrate (localized). */
  apiErrors: {
    noVideo: string;
    notVideo: string;
    tooLarge: string;
    ttsFailed: string;
    unexpected: string;
  };
}

export const messages: Record<Lang, Messages> = {
  "pt-BR": {
    htmlLang: "pt-BR",
    langToggleAria: "Idioma",
    hero: {
      badge: "rádio de várzea",
      wordmark: { pre: "NARRA", mid: "MEU", post: "GOL" },
      tagline: "a IA que narra seu gol de várzea ⚽",
    },
    controls: {
      styleLegend: "Estilo do locutor",
      generate: "Gerar narração",
      needVideo: "Suba o vídeo do lance para o locutor entrar em campo.",
    },
    upload: {
      aria: "Enviar o vídeo do seu lance",
      prompt: "Solte o vídeo do seu lance aqui ou clique para escolher",
      hint: (mb) => `Formatos de vídeo até ${mb} MB`,
      change: "Trocar vídeo",
      errNotVideo: "O arquivo precisa ser um vídeo.",
      errTooLarge: (mb) => `O vídeo deve ter no máximo ${mb} MB.`,
    },
    style: {
      groupAria: "Estilo da narração",
      classic: { title: "Clássico", subtitle: "locutor de rádio comedido" },
      hype: { title: "Empolgadão", subtitle: "narração over-the-top" },
    },
    player: {
      aria: "Narração gerada",
      play: "▶ Ouvir a narração",
      playAria: "Ouvir a narração do lance",
      pause: "⏸ Pausar",
      pauseAria: "Pausar a narração",
      download: "⬇ Baixar narração (mp3)",
      scriptHeading: "Roteiro da narração",
    },
    share: {
      heading: "Quer postar nas redes? 📲",
      tip: "Prefere editar do seu jeito? Baixe o vídeo e a narração (mp3) e junte num editor.",
      tools: "Funciona no CapCut, InShot, VN ou direto nos Reels/TikTok.",
      downloadVideo: "⬇ Baixar vídeo (mudo)",
      makeVideo: "🎬 Baixar vídeo narrado (mp4)",
      makingVideo: "Montando o vídeo narrado…",
      makeVideoError:
        "Não rolou montar o vídeo aqui. Baixe o vídeo e o mp3 e junte num editor.",
    },
    states: {
      onAir: "No ar",
      warming: "Aquecendo o locutor… 🎙️",
      warmingSub: "Analisando o lance e escrevendo a narração. Já já sai o gooool.",
      doneTitle: "Gooool! Tá no ar",
      doneSub: "Dá o play pra ouvir a narração do seu lance.",
      reset: "Narrar outro lance",
      retry: "Tentar de novo",
      genericError:
        "Deu ruim na jogada. Não rolou gerar a narração agora — tenta de novo.",
      networkError: "Sem sinal. Confere sua conexão e chuta de novo.",
    },
    footer:
      "Feito na várzea, com café e paixão. Nada é salvo — recarregou, perdeu o lance.",
    apiErrors: {
      noVideo: "Envie um arquivo de vídeo para gerar a narração.",
      notVideo: "O arquivo enviado não é um vídeo válido. Envie um clipe de vídeo.",
      tooLarge:
        "O vídeo é grande demais. Envie um clipe menor (mais curto ou mais leve).",
      ttsFailed:
        "Não foi possível gerar o áudio da narração agora. Tente novamente em instantes.",
      unexpected:
        "Ocorreu um erro inesperado ao processar a narração. Tente novamente.",
    },
  },
  en: {
    htmlLang: "en",
    langToggleAria: "Language",
    hero: {
      badge: "street-football radio",
      wordmark: { pre: "NARRATE", mid: "MY", post: "GOAL" },
      tagline: "the AI that calls your street-football goal ⚽",
    },
    controls: {
      styleLegend: "Commentator style",
      generate: "Generate narration",
      needVideo: "Upload your clip to send the commentator onto the pitch.",
    },
    upload: {
      aria: "Upload your clip",
      prompt: "Drop your clip here or click to choose",
      hint: (mb) => `Video files up to ${mb} MB`,
      change: "Change video",
      errNotVideo: "The file must be a video.",
      errTooLarge: (mb) => `The video must be at most ${mb} MB.`,
    },
    style: {
      groupAria: "Narration style",
      classic: { title: "Classic", subtitle: "measured radio commentator" },
      hype: { title: "Hyped", subtitle: "over-the-top play-by-play" },
    },
    player: {
      aria: "Generated narration",
      play: "▶ Play narration",
      playAria: "Play the narration",
      pause: "⏸ Pause",
      pauseAria: "Pause the narration",
      download: "⬇ Download narration (mp3)",
      scriptHeading: "Narration script",
    },
    share: {
      heading: "Want to post it? 📲",
      tip: "Rather edit it yourself? Download the clip and the narration (mp3) and combine them in an editor.",
      tools: "Works in CapCut, InShot, VN, or straight in Reels/TikTok.",
      downloadVideo: "⬇ Download clip (muted)",
      makeVideo: "🎬 Download narrated video (mp4)",
      makingVideo: "Building the narrated video…",
      makeVideoError:
        "Couldn't build the video here. Download the clip and mp3 and combine them in an editor.",
    },
    states: {
      onAir: "On air",
      warming: "Warming up the commentator… 🎙️",
      warmingSub: "Reading the play and writing the narration. The goool is coming…",
      doneTitle: "Goool! You're on air",
      doneSub: "Hit play to hear your narration.",
      reset: "Narrate another play",
      retry: "Try again",
      genericError:
        "The play went wrong. Couldn't generate the narration right now — try again.",
      networkError: "No signal. Check your connection and take another shot.",
    },
    footer:
      "Made on the várzea, with coffee and passion. Nothing is saved — refresh and the play is gone.",
    apiErrors: {
      noVideo: "Please upload a video file to generate the narration.",
      notVideo: "The uploaded file isn't a valid video. Please upload a video clip.",
      tooLarge:
        "The video is too large. Please upload a smaller clip (shorter or lighter).",
      ttsFailed:
        "We couldn't generate the narration audio right now. Please try again in a moment.",
      unexpected:
        "Something went wrong while processing the narration. Please try again.",
    },
  },
};
