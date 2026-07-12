"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LANG,
  LANGS,
  messages,
  type Lang,
  type Messages,
} from "@/lib/i18n";

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** The message bundle for the current language. */
  m: Messages;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Holds the selected language and exposes the matching message bundle.
 * On first mount, non-Portuguese browsers start in English so international
 * judges land on an English UI without touching the toggle.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const nav =
      typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "";
    // Client-only detection: reading navigator during SSR/initial state would
    // cause a hydration mismatch, so this one-time post-mount setState is
    // intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (nav && !nav.startsWith("pt")) setLang("en");
  }, []);

  useEffect(() => {
    document.documentElement.lang = messages[lang].htmlLang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, m: messages[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

/** Access the current language, setter, and message bundle. */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n deve ser usado dentro de <LanguageProvider>.");
  }
  return ctx;
}

/** A compact PT / EN segmented toggle. */
export function LanguageToggle() {
  const { lang, setLang, m } = useI18n();

  return (
    <div
      role="group"
      aria-label={m.langToggleAria}
      className="inline-flex items-center gap-1 rounded-full border border-giz/20 bg-noite-2/70 p-1 text-xs font-bold"
    >
      {LANGS.map((l) => {
        const active = l === lang;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={active}
            className={[
              "rounded-full px-3 py-1 uppercase tracking-wide transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ouro focus-visible:ring-offset-2 focus-visible:ring-offset-noite",
              active
                ? "bg-ouro text-noite"
                : "text-giz-dim hover:text-giz",
            ].join(" ")}
          >
            {l === "pt-BR" ? "PT" : "EN"}
          </button>
        );
      })}
    </div>
  );
}
