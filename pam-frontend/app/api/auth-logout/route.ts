import { NextResponse } from "next/server";

const COOKIE_NAME = "pam_token";
const PRODUCTION_COOKIE_DOMAIN = ".pick-a-me.me";

function getLogoutRedirectUrl() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  return new URL("/api/auth/logout", apiBase);
}

function getCookieDomains(hostname: string) {
  const domains = new Set<string>();
  const configuredDomain = process.env.COOKIE_DOMAIN?.trim();

  if (configuredDomain) {
    domains.add(configuredDomain);
  }

  // Keep an explicit production fallback, but the critical cleanup for legacy
  // api.pick-a-me.me host-only cookies happens after redirecting to backend logout.
  if (hostname === "pick-a-me.me" || hostname.endsWith(".pick-a-me.me")) {
    domains.add(PRODUCTION_COOKIE_DOMAIN);
  }

  return Array.from(domains);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const response = NextResponse.redirect(getLogoutRedirectUrl());

  const isProduction = process.env.NODE_ENV === "production";
  const base = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProduction ? "; Secure" : ""}`;

  response.headers.append("Set-Cookie", base);

  if (cookieDomain) {
    response.headers.append("Set-Cookie", `${base}; Domain=${cookieDomain}`);
  }

  return response;
}
