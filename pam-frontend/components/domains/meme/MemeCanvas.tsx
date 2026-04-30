"use client";

import React, { useRef, useEffect, useState } from "react";
import { Download, Type, StickyNote, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemeMetadata {
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

export function MemeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("킹받는 문구를 입력하세요");
  const [textPos, setTextPos] = useState({ x: 250, y: 400 });
  const [stickerPos, setStickerPos] = useState({ x: 250, y: 200 });
  const [stickerScale, setStickerScale] = useState(1.0);
  
  // Minimal state for demonstration
  const canvasSize = 500;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and draw background (placeholder for animal image)
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Draw Placeholder for animal image
    ctx.fillStyle = "#e5e7eb";
    ctx.beginPath();
    ctx.arc(250, 200, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9ca3af";
    ctx.font = "14px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Animal Image Placeholder", 250, 200);

    // Draw Sticker Placeholder
    ctx.save();
    ctx.translate(stickerPos.x, stickerPos.y);
    ctx.scale(stickerScale, stickerScale);
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(-25, -25, 50, 50); // Just a square for now
    ctx.fillStyle = "#000";
    ctx.font = "bold 10px Inter";
    ctx.fillText("STICKER", 0, 5);
    ctx.restore();

    // Draw Text
    ctx.fillStyle = "black";
    ctx.font = "bold 32px Inter";
    ctx.textAlign = "center";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.strokeText(text, textPos.x, textPos.y);
    ctx.fillText(text, textPos.x, textPos.y);
  }, [text, textPos, stickerPos, stickerScale]);

  const handleGenerate = () => {
    const metadata: MemeMetadata = {
      text: { content: text, x: textPos.x, y: textPos.y, fontSize: 32 },
      sticker: { id: "default-star", x: stickerPos.x, y: stickerPos.y, scale: stickerScale }
    };
    console.log("Generated JSONB Metadata:", JSON.stringify(metadata, null, 2));
    alert("Metadata generated! Check console.");
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="relative group overflow-hidden rounded-2xl shadow-inner bg-gray-50">
        <canvas 
          ref={canvasRef} 
          width={canvasSize} 
          height={canvasSize}
          className="max-w-full aspect-square cursor-crosshair"
        />
        <div className="absolute inset-0 pointer-events-none border-4 border-transparent group-hover:border-primary/20 transition-colors rounded-2xl" />
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
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Text Y-Pos</label>
            <input 
              type="range" min="0" max="500" 
              value={textPos.y} 
              onChange={(e) => setTextPos(prev => ({ ...prev, y: parseInt(e.target.value) }))}
              className="w-full accent-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Sticker Scale</label>
            <input 
              type="range" min="0.5" max="3" step="0.1"
              value={stickerScale} 
              onChange={(e) => setStickerScale(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10"
        >
          <Download className="w-5 h-5" /> 밈 생성하기 (JSONB 출력)
        </button>
      </div>
    </div>
  );
}
