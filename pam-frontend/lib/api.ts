const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResponse<T> | undefined> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
    });
    return (await res.json()) as ApiResponse<T>;
  } catch (e) {
    console.error("apiFetch error:", e);
    return undefined;
  }
}
