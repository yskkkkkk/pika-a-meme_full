import { GACHA_ANIMALS } from "@/lib/gacha";

export interface MockMemeResponse {
  memeId?: string;
  imagePresignedUrl: string;
  subjectPosition: string;
  phrase: string;
  imageId?: string;
  phraseId?: string;
}

const MOCK_PHRASES = [
  "아 진짜 월요일 싫어", "퇴근하고 싶다", "이게 맞나?", "살려주세요",
  "오늘도 수고했어 나 자신", "아무것도 안 하고 싶다", "돈 많은 백수가 꿈", "커피 수혈 시급",
];
const MOCK_POSITIONS = [
  "top", "bottom", "left", "right", "center",
  "top_left", "top_right", "bottom_left", "bottom_right",
  "full_horizontal", "full_vertical", "full",
];

export function getMockMeme(heartType: "BASIC" | "SPECIAL", tags?: string[]): MockMemeResponse {
  const animal = GACHA_ANIMALS[Math.floor(Math.random() * GACHA_ANIMALS.length)];
  const phrase = MOCK_PHRASES[Math.floor(Math.random() * MOCK_PHRASES.length)];
  const position = MOCK_POSITIONS[Math.floor(Math.random() * MOCK_POSITIONS.length)];
  return {
    imagePresignedUrl: animal.url,
    subjectPosition: position,
    phrase: tags && tags.length > 0 ? `[${tags.join(",")}] ${phrase}` : phrase,
  };
}
