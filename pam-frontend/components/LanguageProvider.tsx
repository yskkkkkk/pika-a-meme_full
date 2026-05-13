"use client";

import { useEffect, useState, ReactNode } from "react";
import { Language, translations } from "@/lib/i18n";
import { LanguageContext } from "@/hooks/useLanguage";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ko");

  useEffect(() => {
    const saved = localStorage.getItem("pam_lang") as Language | null;
    if (saved === "ko" || saved === "en") {
      setLanguageState(saved);
    } else {
      // Browser language check as fallback
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "en") {
        setLanguageState("en");
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("pam_lang", lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
