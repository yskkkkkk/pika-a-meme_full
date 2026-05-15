import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL("/", origin));

  const isProduction = process.env.NODE_ENV === "production";
  const cookieDomain = process.env.COOKIE_DOMAIN ?? "";

  const base = `pam_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProduction ? "; Secure" : ""}`;

  response.headers.append("Set-Cookie", base);

  if (cookieDomain) {
    response.headers.append("Set-Cookie", `${base}; Domain=${cookieDomain}`);
  }

  return response;
}
