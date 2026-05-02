"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Download, Type, Smile, Trash2, Camera, Palette, Share2, CloudUpload, Save, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { STICKER_LIST, FONT_LIST, StickerDef, FontId } from "@/lib/stickers";
import {
  EditorTextItem,
  EditorStickerItem,
  EditorState,
  serializeCanvasState,
} from "@/lib/canvasState";
import { useAuth } from "@/hooks/useAuth";
import { getToken } from "@/lib/auth";

interface MemeCanvasProps {
  backgroundImageUrl?: string;
  templateId?: string;
}

// ------- 유틸 -------
let _uid = 0;
const uid = () => `item-${++_uid}-${Date.now()}`;

const TEXT_COLORS = ["#ffffff", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#ff00ff", "#000000"];

// ------- 컴포넌트 -------
export function MemeCanvas({ backgroundImageUrl, templateId }: MemeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn } = useAuth();

  // Editor items
  const [textItems, setTextItems] = useState<EditorTextItem[]>([]);
  const [stickerItems, setStickerItems] = useState<EditorStickerItem[]>([]);

  // UI state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState<FontId>("impact");
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [newText, setNewText] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "done" | "error">("idle");

  // Drag state
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasSize = 500;

  // ---- 이미지 캐시 ----
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!backgroundImageUrl) {
      bgImageRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = backgroundImageUrl;
    img.onload = () => {
      bgImageRef.current = img;
      drawCanvas();
    };
  }, [backgroundImageUrl]);

  // ---- 캔버스 그리기 ----
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Background image
    if (bgImageRef.current) {
      const img = bgImageRef.current;
      const scale = Math.max(canvasSize / img.width, canvasSize / img.height);
      const x = canvasSize / 2 - (img.width / 2) * scale;
      const y = canvasSize / 2 - (img.height / 2) * scale;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    } else {
      ctx.fillStyle = "#555";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("동물을 먼저 뽑아주세요!", canvasSize / 2, canvasSize / 2);
    }

    // Draw stickers (emoji)
    for (const s of stickerItems) {
      const size = 48 * s.scale;
      ctx.font = `${size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.emoji, s.x, s.y);

      // Selection indicator
      if (s.id === selectedId) {
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(s.x - size / 2 - 4, s.y - size / 2 - 4, size + 8, size + 8);
        ctx.setLineDash([]);
      }
    }

    // Draw text items
    for (const t of textItems) {
      const fontDef = FONT_LIST.find((f) => f.id === t.fontId);
      const fontCss = fontDef?.css || "'Impact', sans-serif";

      ctx.font = `900 ${t.fontSize}px ${fontCss}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Outline
      ctx.strokeStyle = "#000";
      ctx.lineWidth = Math.max(4, t.fontSize / 8);
      ctx.lineJoin = "round";
      ctx.strokeText(t.content, t.x, t.y);

      // Fill
      ctx.fillStyle = t.color;
      ctx.fillText(t.content, t.x, t.y);

      // Selection indicator
      if (t.id === selectedId) {
        const metrics = ctx.measureText(t.content);
        const w = metrics.width + 12;
        const h = t.fontSize + 12;
        ctx.strokeStyle = "#ff00ff";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(t.x - w / 2, t.y - h / 2, w, h);
        ctx.setLineDash([]);
      }
    }
  }, [textItems, stickerItems, selectedId]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // ---- 좌표 변환 (반응형 대응) ----
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasSize / rect.width;
    const scaleY = canvasSize / rect.height;

    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // ---- 히트 테스트 ----
  const hitTest = (x: number, y: number): string | null => {
    // Stickers (역순 = 위에 있는 것 먼저)
    for (let i = stickerItems.length - 1; i >= 0; i--) {
      const s = stickerItems[i];
      const half = (48 * s.scale) / 2 + 8;
      if (Math.abs(x - s.x) < half && Math.abs(y - s.y) < half) return s.id;
    }
    // Text items
    for (let i = textItems.length - 1; i >= 0; i--) {
      const t = textItems[i];
      const halfH = t.fontSize / 2 + 8;
      const halfW = (t.content.length * t.fontSize) / 3 + 16;
      if (Math.abs(x - t.x) < halfW && Math.abs(y - t.y) < halfH) return t.id;
    }
    return null;
  };

  // ---- 드래그 이벤트 ----
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!backgroundImageUrl) return;
    const coords = getCanvasCoords(e);
    const hit = hitTest(coords.x, coords.y);
    setSelectedId(hit);
    if (hit) {
      setDragTarget(hit);
      const item =
        textItems.find((t) => t.id === hit) ||
        stickerItems.find((s) => s.id === hit);
      if (item) {
        setDragOffset({ x: coords.x - item.x, y: coords.y - item.y });
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragTarget) return;
    const coords = getCanvasCoords(e);
    const nx = coords.x - dragOffset.x;
    const ny = coords.y - dragOffset.y;

    setTextItems((prev) =>
      prev.map((t) => (t.id === dragTarget ? { ...t, x: nx, y: ny } : t))
    );
    setStickerItems((prev) =>
      prev.map((s) => (s.id === dragTarget ? { ...s, x: nx, y: ny } : s))
    );
  };

  const handlePointerUp = () => {
    setDragTarget(null);
  };

  // ---- 텍스트 추가 ----
  const addText = () => {
    if (!newText.trim()) return;
    const item: EditorTextItem = {
      id: uid(),
      content: newText.trim(),
      x: canvasSize / 2,
      y: canvasSize / 2,
      fontSize: 40,
      fontId: selectedFont,
      color: selectedColor,
    };
    setTextItems((prev) => [...prev, item]);
    setNewText("");
    setSelectedId(item.id);
  };

  // ---- 스티커 추가 ----
  const addSticker = (def: StickerDef) => {
    const item: EditorStickerItem = {
      id: uid(),
      stickerId: def.id,
      emoji: def.emoji,
      x: canvasSize / 2 + (Math.random() - 0.5) * 100,
      y: canvasSize / 2 + (Math.random() - 0.5) * 100,
      scale: 1.0,
    };
    setStickerItems((prev) => [...prev, item]);
    setSelectedId(item.id);
  };

  // ---- 선택 아이템 삭제 ----
  const deleteSelected = () => {
    if (!selectedId) return;
    setTextItems((prev) => prev.filter((t) => t.id !== selectedId));
    setStickerItems((prev) => prev.filter((s) => s.id !== selectedId));
    setSelectedId(null);
  };

  // ---- 다운로드 ----
  const handleDownload = () => {
    // 선택 표시 없이 다시 그리기
    const prevSelected = selectedId;
    setSelectedId(null);

    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `pika-meme-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setSelectedId(prevSelected);
    });
  };

  // ---- 공유 (Web Share API / 클립보드) ----
  const handleShare = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prevSelected = selectedId;
    setSelectedId(null);

    setTimeout(async () => {
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `pika-meme-${Date.now()}.png`, { type: "image/png" });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "PICK-A-MEME",
            text: "내가 만든 B급 감성 밈을 확인해보세요!",
            files: [file],
          });
        } else if (navigator.clipboard) {
          // Fallback: 클립보드 복사
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
          ]);
          alert("이미지가 클립보드에 복사되었습니다! 원하는 곳에 붙여넣기 해보세요.");
        } else {
          alert("이 브라우저에서는 공유 기능을 지원하지 않습니다. 기기에 저장을 이용해주세요.");
        }
      } catch (e) {
        console.error("공유 실패:", e);
        // AbortError(사용자 취소)는 무시해도 되지만 다른 오류는 안내
        if (e instanceof Error && e.name !== 'AbortError') {
           alert("공유 중 오류가 발생했습니다. 기기에 저장을 이용해주세요.");
        }
      } finally {
        setSelectedId(prevSelected);
      }
    }, 50);
  };

  // ---- 클라우드 저장 Placeholder ----
  const handleCloudSave = () => {
    alert("서버 연동 작업(TASK-260501-02) 진행 중입니다. 곧 내 창고 저장 기능이 오픈됩니다!");
  };

  // ---- 직렬화 ----
  const getCanvasState = (): EditorState => ({
    templateId: templateId || "unknown",
    imageUrl: backgroundImageUrl || "",
    textItems,
    stickerItems,
  });

  // ---- 서버 저장 ----
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prevSelected = selectedId;
    setSelectedId(null);
    setSaveState("saving");

    requestAnimationFrame(() => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setSaveState("error");
          setSelectedId(prevSelected);
          return;
        }
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
          const canvasStateDto = serializeCanvasState(getCanvasState());
          const form = new FormData();
          form.append("image", blob, "meme.png");
          form.append("canvasState", JSON.stringify(canvasStateDto));

          const token = getToken();
          const res = await fetch(
            `${API_BASE}/api/memes?creationOption=BASIC&heartType=BASIC`,
            {
              method: "POST",
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: form,
            }
          );
          if (res.ok) {
            setSaveState("done");
            setTimeout(() => setSaveState("idle"), 3000);
          } else {
            setSaveState("error");
            setTimeout(() => setSaveState("idle"), 3000);
          }
        } catch {
          setSaveState("error");
          setTimeout(() => setSaveState("idle"), 3000);
        } finally {
          setSelectedId(prevSelected);
        }
      }, "image/png");
    });
  };

  const isDisabled = !backgroundImageUrl;

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative group overflow-hidden rounded-2xl shadow-inner bg-gray-900 border-4 border-black"
      >
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="max-w-full aspect-square cursor-crosshair"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
        {isDisabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="p-4 bg-white/90 rounded-full shadow-lg">
              <Camera className="w-8 h-8 text-gray-400 animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="w-full max-w-[500px] space-y-5">
        {/* 텍스트 추가 */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Type className="w-3.5 h-3.5" /> 텍스트 추가
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addText()}
              placeholder="킹받는 문구를 입력하세요"
              disabled={isDisabled}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all disabled:opacity-50 text-sm font-bold"
            />
            <button
              onClick={addText}
              disabled={isDisabled || !newText.trim()}
              className="px-5 py-3 bg-pink-500 text-white font-black rounded-xl hover:bg-pink-600 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              추가
            </button>
          </div>

          {/* 폰트 & 색상 선택 */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-gray-400" />
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                    selectedColor === c ? "border-pink-500 scale-125" : "border-gray-300"
                  )}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <select
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value as FontId)}
              className="px-3 py-1.5 text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg outline-none"
            >
              {FONT_LIST.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 스티커 팔레트 */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Smile className="w-3.5 h-3.5" /> 스티커
          </label>
          <div className="flex flex-wrap gap-2">
            {STICKER_LIST.map((s) => (
              <button
                key={s.id}
                onClick={() => addSticker(s)}
                disabled={isDisabled}
                className="w-10 h-10 flex items-center justify-center text-xl bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title={s.label}
              >
                {s.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 선택된 아이템 컨트롤 */}
        {selectedId && (
          <div className="flex items-center gap-3 p-3 bg-pink-50 border border-pink-200 rounded-xl animate-in fade-in">
            <span className="text-xs font-black text-pink-600 uppercase flex-1">
              선택됨 — 드래그하여 이동
            </span>
            <button
              onClick={deleteSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> 삭제
            </button>
          </div>
        )}

        {/* 저장 / 공유 영역 */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleDownload}
            disabled={isDisabled}
            className="w-full py-4 bg-black text-white font-black rounded-2xl hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" /> 로컬 저장
          </button>
          <button
            onClick={handleShare}
            disabled={isDisabled}
            className="w-full py-4 bg-pink-500 text-white font-black rounded-2xl hover:bg-pink-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Share2 className="w-5 h-5" /> 자랑하기
          </button>
        </div>

        {/* 클라우드 저장 Placeholder (비로그인 시) */}
        {!isLoggedIn && (
          <button
            onClick={handleCloudSave}
            disabled={isDisabled}
            className="w-full py-3 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed mt-2"
          >
            <CloudUpload className="w-4 h-4" /> 내 창고에 영구 저장 (로그인 필요)
          </button>
        )}

        {isLoggedIn && (
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={isDisabled || saveState === "saving"}
              className={cn(
                "flex-1 py-4 font-black rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed",
                saveState === "done"
                  ? "bg-green-500 text-white shadow-green-500/20"
                  : saveState === "error"
                  ? "bg-red-500 text-white shadow-red-500/20"
                  : "bg-pink-500 text-white hover:bg-pink-600 shadow-pink-500/20"
              )}
            >
              {saveState === "saving" && (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {saveState === "done" && <CheckCircle className="w-5 h-5" />}
              {saveState === "error" && <AlertCircle className="w-5 h-5" />}
              {saveState === "idle" && <Save className="w-5 h-5" />}
              {saveState === "saving" ? "저장 중..." : saveState === "done" ? "저장 완료!" : saveState === "error" ? "저장 실패" : "저장하기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
