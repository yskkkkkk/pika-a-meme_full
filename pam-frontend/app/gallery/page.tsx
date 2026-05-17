"use client";

import { MemeGallery } from "@/components/domains/meme/MemeGallery";
import { Images } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function GalleryPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex items-center gap-3 mb-10">
        <div
          className="p-2.5 rounded-xl"
          style={{ backgroundColor: "var(--pam-surface)", border: "1px solid var(--pam-border)" }}
        >
          <Images className="w-5 h-5" style={{ color: "var(--pam-pink)" }} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter" style={{ color: "var(--pam-text)" }}>{t.gallery.publicTitle}</h1>
          <p className="text-sm font-medium" style={{ color: "var(--pam-text-muted)" }}>{t.gallery.publicSubtitle}</p>
        </div>
      </div>
      <MemeGallery />
    </div>
  );
}
