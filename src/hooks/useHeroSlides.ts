import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // 프로젝트 경로에 맞게 수정

export type HeroCard = {
    id: string;
    title: string;
    price: string;
    img: string;
    badge?: string;
};

export type HeroSlide = {
    id: string;
    title: string;     // "\n" 포함 가능
    tags: string;
    heroImage: string;
    cards: HeroCard[];
};

export function useHeroSlides(defaultSlides: HeroSlide[]) {
    const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from("site_settings")
                .select("value")
                .eq("key", "hero_slides")
                .maybeSingle();

            setLoading(false);
            if (error) return;
            if (!data?.value) return;

            try {
                const parsed = JSON.parse(data.value);
                if (Array.isArray(parsed) && parsed.length) setSlides(parsed);
            } catch {
                // 파싱 실패: 기본값 유지
            }
        })();
    }, [defaultSlides]);

    return { slides, setSlides, loading };
}

export async function saveHeroSlides(slides: HeroSlide[]) {
    return supabase.from("site_settings").upsert({
        key: "hero_slides",
        value: JSON.stringify(slides),
    });
}
