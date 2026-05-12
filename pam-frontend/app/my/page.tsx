"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { MyGallery } from "@/components/domains/meme/MyGallery";
import { ArrowLeft } from "lucide-react";

export default function MyPage() {
  const { isLoggedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isLoggedIn) {
      router.replace("/");
    }
  }, [isLoaded, isLoggedIn, router]);

  if (!isLoaded || !isLoggedIn) return null;

  return (
    <div className="flex flex-col flex-1">
      <div
        className="flex items-center gap-3 border-b border-gray-100"
        style={{ padding: "14px 16px" }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center bg-gray-100 rounded-full active:scale-95 transition-transform"
          style={{ width: 36, height: 36 }}
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <h1 className="font-black text-[#111]" style={{ fontSize: 18 }}>
          내 밈 갤러리
        </h1>
      </div>
      <div style={{ padding: "16px 16px 32px" }}>
        <MyGallery />
      </div>
    </div>
  );
}
