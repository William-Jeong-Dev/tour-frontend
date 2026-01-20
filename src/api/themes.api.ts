import { supabase } from "../lib/supabase"; // ✅ 경로 맞춰줘: "@/lib/supabase" 쓰면 더 깔끔

export type ThemeRow = {
    id: string;
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
};

export type ThemeUpsert = {
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
};

export async function listThemesAdmin() {
    const { data, error } = await supabase
        .from("product_themes")
        .select("id,name,slug,sort_order,is_active,created_at,updated_at")
        .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []) as ThemeRow[];
}

export async function listThemesActive() {
    const { data, error } = await supabase
        .from("product_themes")
        .select("id,name,slug,sort_order,is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data ?? []) as ThemeRow[];
}

export async function createTheme(payload: ThemeUpsert) {
    const { data, error } = await supabase
        .from("product_themes")
        .insert(payload)
        .select("id,name,slug,sort_order,is_active")
        .single();

    if (error) throw error;
    return data as ThemeRow;
}

export async function updateTheme(id: string, payload: ThemeUpsert) {
    const { data, error } = await supabase
        .from("product_themes")
        .update(payload)
        .eq("id", id)
        .select("id,name,slug,sort_order,is_active")
        .single();

    if (error) throw error;
    return data as ThemeRow;
}

export async function deleteTheme(id: string) {
    const { error } = await supabase.from("product_themes").delete().eq("id", id);
    if (error) throw error;
    return true;
}
