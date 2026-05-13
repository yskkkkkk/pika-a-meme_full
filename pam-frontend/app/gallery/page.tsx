"use client";

import { MemeGallery } from "@/components/domains/meme/MemeGallery";
import { Images } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function GalleryPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2.5 bg-black rounded-xl">
          <Images className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter">{t.gallery.publicTitle}</h1>
          <p className="text-sm text-gray-400 font-medium">{t.gallery.publicSubtitle}</p>
        </div>
      </div>
      <MemeGallery />
    </div>
  );
}
