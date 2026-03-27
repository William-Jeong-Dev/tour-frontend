import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type HeroCard2 = {
    id: string;
    productId?: string;  // 연결된 상품 ID
    title: string;
    price: string;
    img: string;
    badge?: string;
    tags?: string[];     // subtitle에서 파싱한 해시태그들
};

export type HeroSlide2 = {
    id: string;
    title: string;     // "\n" 포함 가능
    tags: string;
    heroImage: string;
    cards: HeroCard2[];
};

export function useHeroSlides2(defaultSlides: HeroSlide2[]) {
    const [slides, setSlides] = useState<HeroSlide2[]>(defaultSlides);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from("site_settings")
                .select("value")
                .eq("key", "hero_slides2")
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

export async function saveHeroSlides2(slides: HeroSlide2[]) {
    return supabase.from("site_settings").upsert({
        key: "hero_slides2",
        value: JSON.stringify(slides),
    });
}
