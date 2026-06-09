import { useState, useCallback } from "react";
import { GACHA_ANIMALS } from "@/lib/gacha";

export interface MockMemeResponse {
  memeId?: string;
  imagePresignedUrl: string;
  subjectPosition: string;
  phrase: string;
  imageId?: string;
  phraseId?: string;
}

const PHRASES = [
  "아 진짜 월요일 싫어",
  "퇴근하고 싶다",
  "이게 맞나?",
  "살려주세요",
  "오늘도 수고했어 나 자신",
  "아무것도 안 하고 싶다",
  "돈 많은 백수가 꿈",
  "커피 수혈 시급",
];

const POSITIONS = [
  "top",
  "bottom",
  "left",
  "right",
  "center",
  "top_left",
  "top_right",
  "bottom_left",
  "bottom_right",
  "full_horizontal",
  "full_vertical",
  "full",
];

export function useMockMemeApi() {
  const [isLoading, setIsLoading] = useState(false);

  const composeMeme = useCallback(
    async (
      heartType: "BASIC" | "SPECIAL",
      tags?: string[]
    ): Promise<MockMemeResponse> => {
      setIsLoading(true);

      // Simulate network delay (1.5s to 2.5s)
      const delay = Math.floor(Math.random() * 1000) + 1500;
      await new Promise((resolve) => setTimeout(resolve, delay));

      setIsLoading(false);

      // Randomly pick from GACHA_ANIMALS (filter by rarity if needed later)
      const animal =
        GACHA_ANIMALS[Math.floor(Math.random() * GACHA_ANIMALS.length)];
      const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
      const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];

      return {
        imagePresignedUrl: animal.url,
        subjectPosition: position,
        phrase: tags && tags.length > 0 ? `[${tags.join(",")}] ${phrase}` : phrase,
      };
    },
    []
  );

  return { composeMeme, isLoading };
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
