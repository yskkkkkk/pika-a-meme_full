"use client";

import React, { useRef, useEffect, useState } from "react";
import { Download, Type, StickyNote, RefreshCcw, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGuestHeart } from "@/hooks/useGuestHeart";

interface MemeMetadata {
  imageUrl: string;
  text: {
    content: string;
    x: number;
    y: number;
    fontSize: number;
  };
  sticker: {
    id: string;
    x: number;
    y: number;
    scale: number;
  };
}

interface MemeCanvasProps {
  backgroundImageUrl?: string;
}

export function MemeCanvas({ backgroundImageUrl }: MemeCanvasProps) {
  const { hearts, consumeHeart } = useGuestHeart();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("킹받는 문구를 입력하세요");
  const [textPos, setTextPos] = useState({ x: 250, y: 400 });
  const [stickerPos, setStickerPos] = useState({ x: 250, y: 200 });
  const [stickerScale, setStickerScale] = useState(1.0);
  
  const canvasSize = 500;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = async () => {
      // Clear
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      if (backgroundImageUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = backgroundImageUrl;
        await new Promise((resolve) => (img.onload = resolve));
        
        // Draw image (cover style)
        const scale = Math.max(canvasSize / img.width, canvasSize / img.height);
        const x = (canvasSize / 2) - (img.width / 2) * scale;
        const y = (canvasSize / 2) - (img.height / 2) * scale;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      } else {
        // Placeholder state
        ctx.fillStyle = "#9ca3af";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("동물을 먼저 뽑아주세요!", canvasSize / 2, canvasSize / 2);
      }

      // Draw Text
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 6;
      ctx.lineJoin = "round";
      ctx.font = "900 40px Impact, sans-serif";
      ctx.textAlign = "center";
      
      ctx.strokeText(text, textPos.x, textPos.y);
      ctx.fillText(text, textPos.x, textPos.y);

      // Draw Sticker Placeholder
      ctx.beginPath();
      ctx.arc(stickerPos.x, stickerPos.y, 30 * stickerScale, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 0, 0.8)";
      ctx.fill();
    };

    draw();
  }, [backgroundImageUrl, text, textPos, stickerPos, stickerScale]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `pika-meme-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="relative group overflow-hidden rounded-2xl shadow-inner bg-gray-50 border-4 border-black">
        <canvas 
          ref={canvasRef} 
          width={canvasSize} 
          height={canvasSize}
          className="max-w-full aspect-square cursor-crosshair bg-gray-200"
        />
        {!backgroundImageUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
            <div className="p-4 bg-white/90 rounded-full shadow-lg">
              <Camera className="w-8 h-8 text-gray-400 animate-bounce" />
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-[500px] space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Type className="w-3 h-3" /> Meme Text
          </label>
          <input 
            type="text" 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            disabled={!backgroundImageUrl}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Text Y-Pos</label>
            <input 
              type="range" min="0" max="500" 
              value={textPos.y} 
              disabled={!backgroundImageUrl}
              onChange={(e) => setTextPos(prev => ({ ...prev, y: parseInt(e.target.value) }))}
              className="w-full accent-primary disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Sticker Scale</label>
            <input 
              type="range" min="0.5" max="3" step="0.1"
              value={stickerScale} 
              disabled={!backgroundImageUrl}
              onChange={(e) => setStickerScale(parseFloat(e.target.value))}
              className="w-full accent-primary disabled:opacity-50"
            />
          </div>
        </div>

        <button 
          onClick={handleDownload}
          disabled={!backgroundImageUrl}
          className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" /> 밈 저장하기 (PNG)
        </button>
      </div>
    </div>
  );
}
