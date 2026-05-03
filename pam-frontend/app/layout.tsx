import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { HeartDisplay } from "@/components/domains/heart/HeartDisplay";
import { LoginButton } from "@/components/auth/LoginButton";
import Link from "next/link";

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
      <body className={`${inter.className} bg-slate-50 antialiased`}>
        <Providers>
          <nav className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-50">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-xl italic">P</span>
                </div>
                <span className="font-black text-xl tracking-tight">PICK-A-MEME</span>
              </Link>
              <Link
                href="/gallery"
                className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                갤러리
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <HeartDisplay />
              <LoginButton />
            </div>
          </nav>
          <main className="pt-24 pb-12 min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
