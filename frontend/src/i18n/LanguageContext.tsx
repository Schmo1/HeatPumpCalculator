import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setFormatLocale } from "../utils/format";
import { LANGUAGES, LANGUAGE_LOCALES, translations, type Language } from "./translations";

const LANG_KEY = "hp_lang";

function isLanguage(value: string | null): value is Language {
  return value !== null && (LANGUAGES as readonly string[]).includes(value);
}

/** Determines the initial language: stored choice > browser language > "de". */
function detectInitialLanguage(): Language {
  const stored = localStorage.getItem(LANG_KEY);
  if (isLanguage(stored)) {
    return stored;
  }
  const browser = navigator.language.slice(0, 2).toLowerCase();
  if (isLanguage(browser)) {
    return browser;
  }
  return "de";
}

interface I18nState {
  lang: Language;
  setLang: (lang: Language) => void;
  /** Translates a key; {placeholders} are replaced from `vars`. */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<I18nState | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(detectInitialLanguage);

  // Keep the persisted choice, the <html lang> attribute and the number
  // formatter locale in sync with the selected language.
  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
    setFormatLocale(LANGUAGE_LOCALES[lang]);
  }, [lang]);

  const setLang = useCallback((next: Language) => setLangState(next), []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let text = translations[lang][key] ?? translations.de[key] ?? key;
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.replace(`{${name}}`, String(value));
        }
      }
      return text;
    },
    [lang]
  );

  const value = useMemo<I18nState>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): I18nState {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useI18n must be used within a LanguageProvider.");
  }
  return ctx;
}
