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
    <div className="flex flex-col flex-1" style={{ backgroundColor: "var(--pam-bg)" }}>
      <div
        className="flex items-center gap-3"
        style={{ padding: "14px 16px", borderBottom: "1px solid var(--pam-border)" }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center rounded-full active:scale-95 transition-transform"
          style={{ width: 36, height: 36, backgroundColor: "var(--pam-surface)" }}
        >
          <ArrowLeft className="w-4 h-4" style={{ color: "var(--pam-text-sub)" }} />
        </button>
        <h1 className="font-black" style={{ fontSize: 18, color: "var(--pam-text)" }}>
          내 밈 갤러리
        </h1>
      </div>
      <div style={{ padding: "16px 16px 32px" }}>
        <MyGallery />
      </div>
    </div>
  );
}
