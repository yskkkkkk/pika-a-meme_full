"use client";

import React, { useState } from "react";
import { GachaMachine } from "./GachaMachine";
import { MemeCanvas } from "./MemeCanvas";
import { GachaItem } from "@/lib/gacha";
import { Sparkles } from "lucide-react";

export function MemeGeneratorContainer() {
  const [selectedImage, setSelectedImage] = useState<GachaItem | null>(null);

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start px-4">
      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-pink-500 rounded-lg shadow-[0_0_15px_rgba(244,114,182,0.5)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase italic">
            STEP 1. <span className="text-pink-500">동물 뽑기</span>
          </h2>
        </div>
        <GachaMachine onSelect={(item) => setSelectedImage(item)} />
        
        <div className="p-6 bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-2xl">
          <h4 className="font-bold text-yellow-800 mb-1">💡 TIP</h4>
          <p className="text-sm text-yellow-700 leading-relaxed">
            마음에 드는 동물이 나올 때까지 하트를 사용하여 가챠를 돌릴 수 있습니다. 
            스페셜 하트를 사용하면 더 희귀한 동물들이 등장합니다!
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase italic">
            STEP 2. <span className="text-indigo-600">밈 꾸미기</span>
          </h2>
        </div>
        <MemeCanvas backgroundImageUrl={selectedImage?.url} templateId={selectedImage?.id} />
      </div>
    </div>
  );
}
