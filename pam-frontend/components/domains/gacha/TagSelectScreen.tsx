"use client";

import { cn } from "@/lib/utils";

const AVAILABLE_TAGS = [
  "피곤", "직장인", "기쁨", "주말", "귀여움",
  "분노", "놀람", "눈치", "광기", "질문", "의지",
];

const TAG_EMOJI: Record<string, string> = {
  "피곤": "😮‍💨", "직장인": "💼", "기쁨": "🎉",
  "주말": "🌴", "귀여움": "🐾", "분노": "😤",
  "놀람": "😲", "눈치": "👀", "광기": "🤪",
  "질문": "❓", "의지": "💪",
};

interface Props {
  selectedTag: string | null;
  onSelectTag: (tag: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}

export function TagSelectScreen({ selectedTag, onSelectTag, onBack, onConfirm }: Props) {
  return (
    <div
      className="flex-1 flex flex-col w-full animate-in slide-in-from-bottom-8 duration-300"
      style={{ padding: "20px 24px 24px" }}
    >
      <button
        onClick={onBack}
        className="self-start flex items-center gap-1 font-bold"
        style={{ fontSize: 14, marginBottom: 24, color: "var(--pam-text-muted)" }}
      >
        ← 뒤로
      </button>
      <h2 className="font-black" style={{ fontSize: 26, marginBottom: 8, color: "var(--pam-text)" }}>
        오늘의 기분은?
      </h2>
      <p className="font-medium" style={{ fontSize: 14, marginBottom: 24, color: "var(--pam-text-faint)" }}>
        딱 하나만 골라요!
      </p>
      <div className="flex flex-wrap justify-center" style={{ gap: 10, marginBottom: 28 }}>
        {AVAILABLE_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelectTag(tag)}
            className={cn(
              "font-bold border-[1.5px] transition-all flex items-center gap-[5px]",
              selectedTag === tag ? "text-white border-transparent" : "",
            )}
            style={{
              padding: "8px 14px",
              borderRadius: 9999,
              fontSize: 15,
              ...(selectedTag === tag
                ? {
                  background: "linear-gradient(135deg, var(--pam-pink), var(--pam-purple))",
                  boxShadow: "0 2px 10px var(--pam-shadow-pink-btn)",
                  borderColor: "transparent",
                  color: "white",
                }
                : {
                  backgroundColor: "var(--pam-tag-bg)",
                  borderColor: "var(--pam-tag-border)",
                  color: "var(--pam-text-sub)",
                }),
            }}
          >
            <span>{TAG_EMOJI[tag]}</span>
            <span style={{ color: selectedTag === tag ? "rgba(255,255,255,.65)" : "var(--pam-tag-text)" }}>#</span>
            {tag}
          </button>
        ))}
      </div>
      <button
        onClick={onConfirm}
        disabled={!selectedTag}
        className="w-full text-white font-black active:scale-[0.98] transition-transform"
        style={{
          marginTop: "auto",
          padding: 18,
          background: selectedTag ? "var(--pam-text)" : "var(--pam-text-disabled)",
          borderRadius: 22,
          border: "none",
          fontSize: 17,
          cursor: selectedTag ? "pointer" : "not-allowed",
        }}
      >
        {selectedTag ? `#${selectedTag} 로 뽑기!` : "태그를 선택해 주세요"}
      </button>
    </div>
  );
}
