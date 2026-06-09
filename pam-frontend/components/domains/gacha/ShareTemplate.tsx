import { forwardRef } from "react";
import { MemeResult } from "@/hooks/useMemeApi";
import { MemeCanvasCard } from "@/components/domains/meme/MemeCanvasCard";

interface ShareTemplateProps {
  result: MemeResult;
}

export const ShareTemplate = forwardRef<HTMLDivElement, ShareTemplateProps>(
  ({ result }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          // 화면 밖에 렌더링
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: 1080,
          height: 1080,
          backgroundImage: "url(/meme-frame.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: -1,
          fontFamily: "var(--font-pretendard), sans-serif"
        }}
      >
        {/* 중앙 375x375 밈 영역 */}
        <div style={{ width: 375, height: 375, overflow: "hidden", position: "relative" }}>
          <MemeCanvasCard
            imageUrl={result.imagePresignedUrl}
            subjectPosition={result.subjectPosition}
            phrase={result.phrase}
          />
        </div>
      </div>
    );
  }
);
ShareTemplate.displayName = "ShareTemplate";
