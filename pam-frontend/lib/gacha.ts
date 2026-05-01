export interface GachaItem {
  id: string;
  url: string;
  name: string;
  rarity: "BASIC" | "SPECIAL";
}

export const GACHA_ANIMALS: GachaItem[] = [
  {
    id: "capybara-1",
    url: "https://images.unsplash.com/photo-1620216447814-7d526786c8f9?q=80&w=500&auto=format&fit=crop",
    name: "평온한 카피바라",
    rarity: "BASIC",
  },
  {
    id: "cat-1",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=500&auto=format&fit=crop",
    name: "비웃는 고양이",
    rarity: "BASIC",
  },
  {
    id: "llama-1",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop",
    name: "침 뱉기 직전의 라마",
    rarity: "BASIC",
  },
  {
    id: "dog-1",
    url: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=500&auto=format&fit=crop",
    name: "킹받는 시바견",
    rarity: "BASIC",
  },
  {
    id: "pigeon-1",
    url: "https://images.unsplash.com/photo-1520110120835-c96a9ef95692?q=80&w=500&auto=format&fit=crop",
    name: "목 꺾인 비둘기",
    rarity: "BASIC",
  },
  {
    id: "monkey-1",
    url: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=500&auto=format&fit=crop",
    name: "해탈한 원숭이",
    rarity: "BASIC",
  },
  {
    id: "alpaca-1",
    url: "https://images.unsplash.com/photo-1589182337358-2cb63099350c?q=80&w=500&auto=format&fit=crop",
    name: "썩소 알파카",
    rarity: "BASIC",
  },
  {
    id: "goat-1",
    url: "https://images.unsplash.com/photo-1524024973431-2ad916746881?q=80&w=500&auto=format&fit=crop",
    name: "소리 지르는 염소",
    rarity: "SPECIAL",
  },
  {
    id: "quokka-1",
    url: "https://images.unsplash.com/photo-1591567123154-3f6362483861?q=80&w=500&auto=format&fit=crop",
    name: "세상에서 가장 행복한 쿼카",
    rarity: "SPECIAL",
  },
  {
    id: "seal-1",
    url: "https://images.unsplash.com/photo-1591485423007-765bde4139ef?q=80&w=500&auto=format&fit=crop",
    name: "뚠뚠한 물개",
    rarity: "SPECIAL",
  },
  {
    id: "owl-1",
    url: "https://images.unsplash.com/photo-1543549710-8d02984a60b1?q=80&w=500&auto=format&fit=crop",
    name: "정색하는 부엉이",
    rarity: "SPECIAL",
  },
];

export const getRandomAnimal = (rarity: "BASIC" | "SPECIAL" = "BASIC") => {
  const filtered = GACHA_ANIMALS.filter((item) => item.rarity === rarity);
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
};
