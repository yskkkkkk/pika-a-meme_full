import { toCanvas } from "html-to-image";

async function waitForAssets(el: HTMLElement): Promise<void> {
  const images = Array.from(el.querySelectorAll("img"));
  await Promise.all(
    images.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            const done = () => resolve();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
          })
    )
  );
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

export async function captureElement(
  el: HTMLElement,
  mimeType: "image/png" | "image/jpeg" = "image/png",
  quality?: number
): Promise<Blob> {
  await waitForAssets(el);
  const canvas = await toCanvas(el, {
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2) * 1.5,
    skipFonts: false,
    useCORS: true,
  });
  return new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("canvas to blob failed"))),
        mimeType,
        quality
      );
    } catch (e) {
      // R2 CORS 미설정 시 캔버스가 오염돼 SecurityError 발생 — 저장 실패로 처리
      reject(e);
    }
  });
}

function isMobileLike(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

export type SaveResult = "shared" | "downloaded";

/**
 * 이미지를 기기에 저장한다.
 * - 모바일(iOS/Android): navigator.share()로 시스템 공유 시트 열어 "사진에 저장" 사용 (iOS Safari는 <a download>를 무시함)
 * - 데스크톱: <a download>로 직접 다운로드
 */
export async function saveImage(blob: Blob, filename: string): Promise<SaveResult> {
  const file = new File([blob], filename, { type: blob.type });

  if (isMobileLike() && navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] });
    return "shared";
  }

  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
  return "downloaded";
}
