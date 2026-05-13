import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "pick-a-meme | 피카밈",
  description: "B급 감성 동물 사진과 킹받는 문구의 조화",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 다크모드 깜빡임 방지: hydration 전에 테마 적용 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('pam_theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="font-sans font-bold antialiased" style={{ backgroundColor: "var(--pam-bg-outer)" }}>
        <Providers>
          <div className="flex justify-center min-h-[100dvh]">
            <div
              className="w-full max-w-[500px] shadow-2xl relative flex flex-col overflow-hidden"
              style={{
                backgroundColor: "var(--pam-bg)",
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
                paddingLeft: "env(safe-area-inset-left)",
                paddingRight: "env(safe-area-inset-right)",
              }}
            >
              <main className="flex-1 flex flex-col relative">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
