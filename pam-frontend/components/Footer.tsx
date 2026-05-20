// Recruiter & Dev-oriented Dual-layer Footer: 
// Leverages desktop outer-shell margin space to display developer credentials (GitHub, Blog) 
// without cluttering the compact mobile App shell UI.

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface FooterProps {
  insideShell?: boolean;
}

export function Footer({ insideShell = false }: FooterProps) {
  const [activeTheme, setActiveTheme] = useState<string>("dark");

  // 현재 테마 감지 (다크모드에 따른 네온 글로우 색조 조정용)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute("data-theme") || "dark";
      setActiveTheme(theme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const initialTheme = document.documentElement.getAttribute("data-theme") || "dark";
    setActiveTheme(initialTheme);

    return () => observer.disconnect();
  }, []);

  // 셸 외부 (데스크톱용) 레이아웃
  if (!insideShell) {
    return (
      <div 
        className="hidden md:flex flex-col gap-3 fixed left-[calc(50%+270px)] bottom-8 z-50 p-4 rounded-2xl glass-footer-card animate-fade-in-footer"
        style={{
          width: "200px",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--pam-border-pink)",
          boxShadow: "0 8px 32px var(--pam-shadow-pink)",
        }}
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-footer font-semibold opacity-60">
            🎰 Creator Profile
          </span>
          <h4 className="text-sm font-black text-primary-footer leading-none">
            류대성 <span className="text-xs font-normal opacity-75">/ 4년차 풀스택</span>
          </h4>
          <p className="text-[11px] font-medium leading-relaxed text-secondary-footer mt-1">
            스프링의 안정성과 브라우저의 역동성을 모두 책임집니다.
          </p>
        </div>

        <hr className="border-footer mt-1 mb-1" />

        <div className="flex flex-col gap-2">
          {/* GitHub Link */}
          <a
            href="https://github.com/yskkkkkk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl btn-footer-link transition-all duration-300 font-bold text-xs"
          >
            <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>대성 GitHub</span>
          </a>

          {/* Dev Blog Link */}
          <Link
            href="/blog"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl btn-footer-link transition-all duration-300 font-bold text-xs"
          >
            <svg className="w-4 h-4 stroke-current fill-none flex-shrink-0" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="10" r="1" />
              <circle cx="16" cy="10" r="1" />
              <circle cx="8" cy="10" r="1" />
            </svg>
            <span>🎰 Dev Blog</span>
          </Link>
        </div>
      </div>
    );
  }

  // 셸 내부 (모바일용 - 스크롤 최하단 배치)
  return (
    <div className="flex flex-col items-center gap-2 py-6 px-4 mt-8 w-full border-t border-dashed border-footer-mobile">
      <div className="flex items-center gap-4">
        {/* GitHub Link */}
        <a
          href="https://github.com/yskkkkkk"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-footer-mobile font-bold hover:text-pink transition-colors duration-200"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span>GitHub</span>
        </a>

        <span className="text-[10px] text-muted-footer-mobile opacity-40">|</span>

        {/* Dev Blog Link */}
        <Link
          href="/blog"
          className="flex items-center gap-1.5 text-xs text-muted-footer-mobile font-bold hover:text-pink transition-colors duration-200"
        >
          <svg className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth="2.4" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="10" r="1.2" />
            <circle cx="16" cy="10" r="1.2" />
            <circle cx="8" cy="10" r="1.2" />
          </svg>
          <span>🎰 Dev Blog</span>
        </Link>
      </div>
      <span className="text-[10px] text-muted-footer-mobile font-medium opacity-50 tracking-wider">
        © 2026 pick-a-meme. all rights reserved.
      </span>
    </div>
  );
}
