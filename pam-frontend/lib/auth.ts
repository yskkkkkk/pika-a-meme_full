const TOKEN_KEY = "pam_token";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getLoginUrl(provider: "kakao" | "google"): string {
  return `${API_BASE}/oauth2/authorization/${provider}`;
}
