const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function getLoginUrl(provider: "kakao" | "google"): string {
  return `${API_BASE}/oauth2/authorization/${provider}`;
}
