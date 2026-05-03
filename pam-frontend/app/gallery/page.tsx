import { MemeGallery } from "@/components/domains/meme/MemeGallery";
import { Images } from "lucide-react";

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2.5 bg-black rounded-xl">
          <Images className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter">밈 갤러리</h1>
          <p className="text-sm text-gray-400 font-medium">모두가 만든 B급 감성 밈 모음</p>
        </div>
      </div>
      <MemeGallery />
    </div>
  );
}
