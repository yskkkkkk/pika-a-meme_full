import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "pick-a-meme | 픽-아-밈",
  description: "B급 감성 동물 사진과 킹받는 문구의 조화",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-slate-100 antialiased`}>
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
