import { supabase } from "../lib/supabase";

export type AreaRow = {
    id: string;
    theme_id: string;
    name: string;
    slug: string;
    sort_order: number | null;
    is_active: boolean | null;
    created_at?: string;
    updated_at?: string;
};

export async function adminListAreas(params?: { themeId?: string }) {
    let q = supabase
        .from("product_areas")
        .select("id,theme_id,name,slug,sort_order,is_active,created_at,updated_at")
        .order("theme_id", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

    if (params?.themeId) q = q.eq("theme_id", params.themeId);

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as AreaRow[];
}

export async function listAreasByTheme(themeId: string) {
    const { data, error } = await supabase
        .from("product_areas")
        .select("id,theme_id,name,slug,sort_order,is_active")
        .eq("theme_id", themeId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

    if (error) throw error;
    return (data ?? []) as AreaRow[];
}

export async function adminCreateArea(input: {
    theme_id: string;
    name: string;
    slug: string;
    sort_order?: number;
    is_active?: boolean;
}) {
    const { data, error } = await supabase
        .from("product_areas")
        .insert({
            theme_id: input.theme_id,
            name: input.name,
            slug: input.slug,
            sort_order: input.sort_order ?? 0,
            is_active: input.is_active ?? true,
        })
        .select("id,theme_id,name,slug,sort_order,is_active,created_at,updated_at")
        .single();

    if (error) throw error;
    return data as AreaRow;
}

export async function adminUpdateArea(
    id: string,
    patch: Partial<Pick<AreaRow, "name" | "slug" | "sort_order" | "is_active" | "theme_id">>
) {
    const { data, error } = await supabase
        .from("product_areas")
        .update({
            ...patch,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("id,theme_id,name,slug,sort_order,is_active,created_at,updated_at")
        .single();

    if (error) throw error;
    return data as AreaRow;
}

export async function adminDeleteArea(id: string) {
    const { error } = await supabase.from("product_areas").delete().eq("id", id);
    if (error) throw error;
    return true;
}
