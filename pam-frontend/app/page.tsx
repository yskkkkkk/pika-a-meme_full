import { MemeCanvas } from "@/components/domains/meme/MemeCanvas";

export default function Home() {
  return (
    <div className="container mx-auto px-4 flex flex-col items-center">
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900">
          오늘의 <span className="text-primary italic">'킹받는'</span> 밈 생성기
        </h1>
        <p className="text-gray-500 font-medium">
          동물 사진을 뽑고, 문구를 더해 친구들에게 공유하세요.
        </p>
      </div>
      
      <MemeCanvas />
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-2">⚡️ 실시간 충전</h3>
          <p className="text-sm text-gray-500">일반 하트는 5분마다 자동으로 충전됩니다.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-2">💎 스페셜 밈</h3>
          <p className="text-sm text-gray-500">스페셜 하트로 더 다양한 스티커와 폰트를 사용하세요.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-2">📦 클라우드 저장</h3>
          <p className="text-sm text-gray-500">완성된 밈은 Cloudflare R2에 안전하게 보관됩니다.</p>
        </div>
      </div>
    </div>
  );
}
