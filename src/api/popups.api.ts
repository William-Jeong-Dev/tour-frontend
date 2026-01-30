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
        // start_at: null 이거나 now 이하
        .or(`start_at.is.null,start_at.lte.${now}`)
        // end_at: null 이거나 now 이상
        .or(`end_at.is.null,end_at.gte.${now}`)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as PopupRow[];
}

export async function adminListPopups() {
    const { data, error } = await supabase
        .from("site_popups")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as PopupRow[];
}

export async function adminCreatePopup(input: Partial<PopupRow>) {
    const { data, error } = await supabase
        .from("site_popups")
        .insert({
            title: input.title ?? "새 팝업",
            is_active: input.is_active ?? true,
            left_px: input.left_px ?? 0,
            top_px: input.top_px ?? 0,
            width_px: input.width_px ?? 400,
            content_html: input.content_html ?? "",
            start_at: input.start_at ?? null,
            end_at: input.end_at ?? null,
            sort_order: input.sort_order ?? 0,
        })
        .select("*")
        .single();

    if (error) throw error;
    return data as PopupRow;
}

export async function adminUpdatePopup(id: string, patch: Partial<PopupRow>) {
    const { data, error } = await supabase
        .from("site_popups")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();

    if (error) throw error;
    return data as PopupRow;
}

export async function adminDeletePopup(id: string) {
    const { error } = await supabase.from("site_popups").delete().eq("id", id);
    if (error) throw error;
    return true;
}

// ✅ 이미지 업로드: site-assets/popup
export async function uploadPopupImage(file: File) {
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const safeExt = ["png", "jpg", "jpeg", "webp"].includes(ext) ? ext : "png";

    const path = `popup/${crypto.randomUUID()}.${safeExt}`;

    const { error } = await supabase.storage
        .from("site-assets")
        .upload(path, file, { upsert: false, contentType: file.type || undefined });

    if (error) throw error;

    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    return data.publicUrl; // ✅ 에디터에 <img src="...">로 꽂기 좋음
}