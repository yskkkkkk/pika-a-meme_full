"use client";

interface Props {
  message: string | null;
}

export function Toast({ message }: Props) {
  if (!message) return null;
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 text-sm font-bold rounded-2xl shadow-xl z-[100] whitespace-nowrap animate-fade-in"
      style={{ backgroundColor: "var(--pam-text)", color: "var(--pam-bg)" }}
    >
      {message}
    </div>
  );
}
