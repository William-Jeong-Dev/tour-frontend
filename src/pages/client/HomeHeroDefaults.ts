import type { HeroSlide } from "../../hooks/useHeroSlides";

const heroSideCards = [
    {
        id: "hero-1",
        title: "[얼리버드] 오키나와 실속 호텔+골프",
        price: "979,000원~",
        img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
        badge: "오키나와",
    },
    {
        id: "hero-2",
        title: "[얼리버드] 미야코지마 브릿지베이",
        price: "1,059,000원~",
        img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
        badge: "미야코지마",
    },
];

export const defaultHeroSlides: HeroSlide[] = [
    {
        id: "s1",
        title: "추운 겨울에도 따뜻하게,\n남국 겨울 골프 🎁 🏝️",
        tags: "#겨울골프 #남국골프 #오키나와골프 #미야코지마골프",
        heroImage:
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2400&q=80",
        cards: heroSideCards,
    },
    {
        id: "s2",
        title: "설/삼일절 연휴 골프여행\n좌석 한정 특가 📣",
        tags: "#연휴골프 #한정특가 #항공포함 #선착순",
        heroImage:
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=80",
        cards: heroSideCards,
    },
    {
        id: "s3",
        title: "온천 + 골프 조합\n힐링 완성 ♨️⛳",
        tags: "#온천골프 #가이세키 #프리미엄",
        heroImage:
            "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2400&q=80",
        cards: heroSideCards,
    },
];
