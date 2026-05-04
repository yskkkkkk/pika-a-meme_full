import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "pick-a-meme | 픽-아-밈",
  description: "B급 감성 동물 사진과 킹받는 문구의 조화",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="font-sans font-medium bg-slate-100 antialiased">
        <Providers>
          <div className="flex justify-center min-h-[100dvh]">
            <div className="w-full max-w-[500px] bg-white shadow-2xl relative flex flex-col overflow-hidden">
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
