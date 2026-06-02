import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "pick-a-meme",
  description: "B급 감성 동물 사진과 킹받는 문구의 조화",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "pick-a-meme",
    description: "B급 감성 동물 사진과 킹받는 문구의 조화",
    url: "https://pick-a-me.me",
    siteName: "pick-a-meme",
    images: [{ url: "https://pick-a-me.me/og-image.png", width: 1086, height: 570 }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://pick-a-me.me/og-image.png"],
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
        {/* 밈 말풍선용 디스플레이 폰트 (Google Fonts) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Jua&family=Nanum+Pen+Script&family=Yeon+Sung&display=swap"
        />
      </head>
      <body className="font-sans font-bold antialiased" style={{ backgroundColor: "var(--pam-bg-outer)" }}>
        <Providers>
          <div className="flex justify-center min-h-[100dvh] relative">
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
            {/* 데스크톱 접속 시 모바일 셸 바깥 여백에 안착되는 프리미엄 푸터 */}
            <Footer insideShell={false} />
          </div>
        </Providers>
      </body>
    </html>
  );
}

