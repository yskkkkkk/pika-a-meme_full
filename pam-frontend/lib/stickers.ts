/**
 * B급 감성 스티커 에셋 정의
 * 실제 이미지 대신 이모지/텍스트 기반 스티커를 사용하여 CORS 문제를 회피합니다.
 */

export interface StickerDef {
  id: string;
  emoji: string;
  label: string;
  category: "emotion" | "effect" | "text";
}

export const STICKER_LIST: StickerDef[] = [
  // 감정 계열
  { id: "sunglasses", emoji: "😎", label: "선글라스", category: "emotion" },
  { id: "fire",       emoji: "🔥", label: "불꽃",     category: "emotion" },
  { id: "skull",      emoji: "💀", label: "킹받음",   category: "emotion" },
  { id: "clown",      emoji: "🤡", label: "광대",     category: "emotion" },
  { id: "rage",       emoji: "🤬", label: "분노",     category: "emotion" },
  { id: "crying",     emoji: "😭", label: "울음",     category: "emotion" },

  // 효과 계열
  { id: "sparkles",   emoji: "✨", label: "반짝이",   category: "effect" },
  { id: "boom",       emoji: "💥", label: "폭발",     category: "effect" },
  { id: "100",        emoji: "💯", label: "백점",     category: "effect" },
  { id: "crown",      emoji: "👑", label: "왕관",     category: "effect" },
  { id: "sweat",      emoji: "💧", label: "땀",       category: "effect" },

  // 텍스트 계열
  { id: "what",       emoji: "❓", label: "뭐?",     category: "text" },
  { id: "exclaim",    emoji: "❗", label: "헐!",     category: "text" },
  { id: "no",         emoji: "🚫", label: "안돼",     category: "text" },
];

/** B급 감성 폰트 리스트 */
export const FONT_LIST = [
  { id: "impact",   label: "Impact",   css: "'Impact', sans-serif" },
  { id: "gothic",   label: "고딕",      css: "'Noto Sans KR', sans-serif" },
  { id: "serif",    label: "궁서",      css: "'Noto Serif KR', serif" },
  { id: "comic",    label: "Comic",    css: "'Comic Sans MS', cursive" },
  { id: "mono",     label: "Mono",     css: "'Courier New', monospace" },
] as const;

export type FontId = typeof FONT_LIST[number]["id"];
