import { MemeGeneratorContainer } from "@/components/domains/meme/MemeGeneratorContainer";

export default function Home() {
  return (
    <div className="container mx-auto px-4 flex flex-col items-center pb-20">
      <div className="text-center mt-12 mb-16 space-y-4">
        <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full mb-2">
          B-Grade Aesthetic Meme Factory
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-none">
          PICK-A-<span className="text-primary italic">MEME</span>
        </h1>
        <p className="text-xl text-gray-500 font-medium max-w-lg mx-auto">
          동물 사진을 뽑고, 킹받는 문구를 더해<br />
          나만의 <span className="text-gray-900 font-bold">B급 감성 밈</span>을 완성하세요.
        </p>
      </div>
      
      <MemeGeneratorContainer />
      
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all group">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="text-2xl">⚡️</span>
          </div>
          <h3 className="text-xl font-bold mb-3">실시간 충전</h3>
          <p className="text-gray-500 leading-relaxed">일반 하트는 5분마다 자동으로 충전됩니다. 끊임없이 밈을 생산하세요!</p>
        </div>
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all group">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="text-2xl">💎</span>
          </div>
          <h3 className="text-xl font-bold mb-3">스페셜 밈</h3>
          <p className="text-gray-500 leading-relaxed">스페셜 하트로 더 다양한 스티커와 폰트를 사용해 '진짜' 킹받음을 선사하세요.</p>
        </div>
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all group">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="text-xl font-bold mb-3">클라우드 저장</h3>
          <p className="text-gray-500 leading-relaxed">완성된 밈은 Cloudflare R2에 안전하게 보관되어 언제든 다시 꺼내볼 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
