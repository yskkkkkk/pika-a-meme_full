import ko from "@/public/locales/ko.json";
import en from "@/public/locales/en.json";

export type Language = "ko" | "en";
export type TranslationMessages = typeof ko;
export type KoreanParticle = "을" | "를" | "이" | "가" | "은" | "는";

export const translations: Record<Language, TranslationMessages> = {
  ko,
  en,
};

function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

function hasFinalConsonant(word: string) {
  const last = word.trim().charCodeAt(word.trim().length - 1);
  if (last < 0xac00 || last > 0xd7a3) return false;
  return (last - 0xac00) % 28 !== 0;
}

function resolveParticle(word: string, particle: KoreanParticle) {
  const batchim = hasFinalConsonant(word);
  if (particle === "을" || particle === "를") return batchim ? "을" : "를";
  if (particle === "이" || particle === "가") return batchim ? "이" : "가";
  return batchim ? "은" : "는";
}

export function createTranslator(language: Language) {
  const messages = translations[language];

  return {
    ...messages,
    format: {
      homeSubtitleUser: (name: string) => format(messages.home.subtitleUser, { name }),
      totalCount: (count: number) => format(messages.gallery.totalCount, { count }),
      drawWithTag: (tag: string) => format(messages.gacha.drawWithTag, { tag }),
    },
    memeWithParticle: (particle: KoreanParticle) => {
      if (language !== "ko") return "a Meme";
      const meme = messages.brand.meme;
      return `${meme}${resolveParticle(meme, particle)}`;
    },
  };
}

export type Translator = ReturnType<typeof createTranslator>;
export type TranslationKeys = keyof TranslationMessages;
