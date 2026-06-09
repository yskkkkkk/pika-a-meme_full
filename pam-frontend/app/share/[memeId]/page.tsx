import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";

interface Props {
  params: { memeId: string };
}

async function getMemeData(memeId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/memes/share/${memeId}`, {
      next: { revalidate: 60 } // 1분 캐싱
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meme = await getMemeData(params.memeId);
  
  if (!meme) {
    return {
      title: "PICK-A-MEME | 밈을 찾을 수 없습니다",
      description: "삭제되었거나 비공개된 밈입니다."
    };
  }

  const title = `PICK-A-MEME | ${meme.phraseText}`;
  const description = "내가 뽑은 동물 밈을 확인해보세요!";
  const ogImageUrl = meme.ogImageUrl || meme.imageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1080,
          height: 1080,
          alt: "PICK-A-MEME 결과",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const meme = await getMemeData(params.memeId);

  if (!meme) {
    notFound();
  }

  const ogImageUrl = meme.ogImageUrl || meme.imageUrl;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] p-4 text-white">
      <div className="max-w-md w-full flex flex-col items-center gap-6">
        <h1 className="text-2xl font-black text-center mb-4 leading-snug">
          친구가 공유한 밈 도착!
        </h1>
        
        <div className="w-full aspect-square relative rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={ogImageUrl}
            alt={meme.phraseText}
            fill
            className="object-cover"
            unoptimized // R2 외부 이미지이므로 unoptimized
          />
        </div>

        <a
          href="/"
          className="w-full py-4 rounded-xl text-center font-black text-lg shadow-lg active:scale-95 transition-all"
          style={{ background: "linear-gradient(135deg, var(--pam-pink), var(--pam-purple))" }}
        >
          나도 하러가기 🐾
        </a>
      </div>
    </div>
  );
}
