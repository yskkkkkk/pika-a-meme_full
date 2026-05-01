/**
 * canvas_state 직렬화 유틸리티
 * 프론트엔드 편집 상태 → 백엔드 CanvasState DTO 변환
 */

import { FontId, FONT_LIST } from "./stickers";

/** 프론트엔드 내부 편집 상태 */
export interface EditorTextItem {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontId: FontId;
  color: string;
}

export interface EditorStickerItem {
  id: string;       // unique instance id
  stickerId: string; // sticker definition id
  emoji: string;
  x: number;
  y: number;
  scale: number;
}

export interface EditorState {
  templateId: string; // gacha animal id (e.g. "cat-1")
  imageUrl: string;
  textItems: EditorTextItem[];
  stickerItems: EditorStickerItem[];
}

/** 백엔드 CanvasState DTO (POST /api/memes 용) */
export interface CanvasStateDTO {
  templateId: string;
  textItems: {
    content: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    color: string;
  }[];
  stickerItems: {
    stickerId: string;
    x: number;
    y: number;
    scale: number;
  }[];
}

/** EditorState → CanvasStateDTO 변환 */
export function serializeCanvasState(state: EditorState): CanvasStateDTO {
  const fontMap = Object.fromEntries(
    FONT_LIST.map((f) => [f.id, f.css])
  );

  return {
    templateId: state.templateId,
    textItems: state.textItems.map((t) => ({
      content: t.content,
      x: t.x,
      y: t.y,
      fontSize: t.fontSize,
      fontFamily: fontMap[t.fontId] || "default",
      color: t.color,
    })),
    stickerItems: state.stickerItems.map((s) => ({
      stickerId: s.stickerId,
      x: s.x,
      y: s.y,
      scale: s.scale,
    })),
  };
}
