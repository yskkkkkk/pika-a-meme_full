import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL("/", origin));

  const isProduction = process.env.NODE_ENV === "production";
  const cookieDomain = process.env.COOKIE_DOMAIN ?? "";

  const base = `pam_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProduction ? "; Secure" : ""}`;

  // domain 없는 쿠키 삭제 (로컬 개발 및 이전 발급분)
  response.headers.append("Set-Cookie", base);

  // domain 있는 쿠키 삭제 (운영 발급분)
  if (cookieDomain) {
    response.headers.append("Set-Cookie", `${base}; Domain=${cookieDomain}`);
  }

  return response;
}
