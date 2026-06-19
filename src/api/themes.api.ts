import { supabase } from "../lib/supabase"; // ✅ 경로 맞춰줘: "@/lib/supabase" 쓰면 더 깔끔

// 테마 페이지 상단 안내 문구 + FAQ(JSON-LD FAQPage용)
export type ThemeFaq = {
    question: string;
    answer: string;
};

export type ThemeRow = {
    id: string;
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
    intro_title: string | null; // 예: "일본 골프여행 안내"
    intro_body: string | null;  // 본문 문단 (줄바꿈 허용)
    faq: ThemeFaq[];            // SEO 구조화데이터(FAQPage)
    created_at?: string;
    updated_at?: string;
};

export type ThemeUpsert = {
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
    intro_title: string | null;
    intro_body: string | null;
    faq: ThemeFaq[];
};

// product_themes 공통 select 컬럼
const THEME_COLS = "id,name,slug,sort_order,is_active,intro_title,intro_body,faq";

// DB의 faq(jsonb)가 null로 오는 경우 등 안전하게 배열로 정규화
function normalizeTheme<T extends { faq?: unknown }>(row: T): T & { faq: ThemeFaq[] } {
    return {
        ...row,
        faq: Array.isArray(row?.faq) ? (row.faq as ThemeFaq[]) : [],
    };
}

export async function listThemesAdmin() {
    const { data, error } = await supabase
        .from("product_themes")
        .select(`${THEME_COLS},created_at,updated_at`)
        .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(normalizeTheme) as ThemeRow[];
}

export async function listThemesActive() {
    const { data, error } = await supabase
        .from("product_themes")
        .select(THEME_COLS)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(normalizeTheme) as ThemeRow[];
}

export async function createTheme(payload: ThemeUpsert) {
    const { data, error } = await supabase
        .from("product_themes")
        .insert(payload)
        .select(THEME_COLS)
        .single();

    if (error) throw error;
    return normalizeTheme(data) as ThemeRow;
}

export async function updateTheme(id: string, payload: ThemeUpsert) {
    const { data, error } = await supabase
        .from("product_themes")
        .update(payload)
        .eq("id", id)
        .select(THEME_COLS)
        .single();

    if (error) throw error;
    return normalizeTheme(data) as ThemeRow;
}

export async function deleteTheme(id: string) {
    const { error } = await supabase.from("product_themes").delete().eq("id", id);
    if (error) throw error;
    return true;
}

export async function getThemeById(id: string) {
    const { data, error } = await supabase
        .from("product_themes")
        .select(THEME_COLS)
        .eq("id", id)
        .maybeSingle();

    if (error) throw error;
    return (data ? normalizeTheme(data) : null) as ThemeRow | null;
}