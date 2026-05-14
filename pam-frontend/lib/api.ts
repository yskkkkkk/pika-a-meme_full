const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const DEFAULT_TIMEOUT_MS = 15_000;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<ApiResponse<T> | undefined> {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timerId);
    return (await res.json()) as ApiResponse<T>;
  } catch (e) {
    clearTimeout(timerId);
    if (e instanceof Error && e.name === "AbortError") {
      return { success: false, error: { code: "TIMEOUT", message: "TIMEOUT" } };
    }
    console.error("apiFetch error:", e);
    return undefined; // 네트워크 단절 → composeMeme에서 mock 폴백
  }
}
