export type CardItem = {
    id: string;
    title: string;
    subtitle: string;
    price: string;
    tags: string[];
    image: string;
};

export const cards: CardItem[] = [
    {
        id: "1",
        title: "미야자키 시내리조트 3박",
        subtitle: "[일본골프] 미야자키 ANA 리조트",
        price: "639,000원~",
        tags: ["얼리버드", "온천골프", "실속"],
        image: "https://images.unsplash.com/photo-1519817914152-22f90e5a98f0?auto=format&fit=crop&w=1400&q=60",
    },
    {
        id: "2",
        title: "가고시마 시내 호텔 3박",
        subtitle: "[일본골프] 사가/가고시마",
        price: "659,000원~",
        tags: ["얼리버드", "시내호텔"],
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=60",
    },
    {
        id: "3",
        title: "오키나와 국제거리 3박",
        subtitle: "[일본골프] 오키나와 실속",
        price: "979,000원~",
        tags: ["골프", "시내", "실속"],
        image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=60",
    },
    {
        id: "4",
        title: "미야코지마 브릿지뷰 3박",
        subtitle: "[일본골프] 미야코지마",
        price: "1,059,000원~",
        tags: ["프리미엄", "온천"],
        image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=60",
    },
];
