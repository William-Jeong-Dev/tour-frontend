import { supabase } from "../lib/supabase";

export type PopupRow = {
    id: string;
    title: string;
    is_active: boolean;
    left_px: number;
    top_px: number;
    width_px: number;
    content_html: string;
    start_at: string | null;
    end_at: string | null;
    sort_order: number | null;
    created_at: string;
    updated_at: string;
};

export async function listActivePopupsForClient(): Promise<PopupRow[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("site_popups")
        .select("*")
        .eq("is_active", true)
        .or(`start_at.is.null,start_at.lte.${now}`)
        .or(`end_at.is.null,end_at.gte.${now}`)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as PopupRow[];
}
