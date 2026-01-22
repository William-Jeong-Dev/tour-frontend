// src/api/notices.api.ts
import { supabase } from "../lib/supabase";

export type Notice = {
    id: string;
    title: string;
    content: string;
    category: string;
    is_pinned: boolean;
    is_published: boolean;
    created_at: string;
    updated_at: string;
};

export type NoticeListResult = { rows: Notice[]; count: number };

export async function listNotices(args: {
    q?: string;
    tab?: "ALL" | "PINNED" | "NORMAL";
    page?: number;
    limit?: number;
}): Promise<NoticeListResult> {
    const page = args.page ?? 1;
    const limit = args.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from("notices")
        .select("id,title,category,is_pinned,is_published,created_at,updated_at", { count: "exact" })
        .eq("is_published", true)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to);

    const keyword = (args.q ?? "").trim();
    if (keyword) query = query.ilike("title", `%${keyword}%`);

    if (args.tab === "PINNED") query = query.eq("is_pinned", true);
    if (args.tab === "NORMAL") query = query.eq("is_pinned", false);

    const { data, error, count } = await query;
    if (error) throw error;

    return { rows: (data ?? []) as Notice[], count: count ?? 0 };
}

export async function getNotice(id: string): Promise<Notice> {
    const { data, error } = await supabase
        .from("notices")
        .select("id,title,content,category,is_pinned,is_published,created_at,updated_at")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data as Notice;
}

/** ----------------- Admin ----------------- */

export async function adminListNotices(args: {
    q?: string;
    page?: number;
    limit?: number;
    published?: "ALL" | "Y" | "N";
}): Promise<NoticeListResult> {
    const page = args.page ?? 1;
    const limit = args.limit ?? 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from("notices")
        .select("id,title,category,is_pinned,is_published,created_at,updated_at", { count: "exact" })
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to);

    const keyword = (args.q ?? "").trim();
    if (keyword) query = query.ilike("title", `%${keyword}%`);

    if (args.published === "Y") query = query.eq("is_published", true);
    if (args.published === "N") query = query.eq("is_published", false);

    const { data, error, count } = await query;
    if (error) throw error;

    return { rows: (data ?? []) as Notice[], count: count ?? 0 };
}

export async function createNotice(payload: {
    title: string;
    content: string;
    category?: string;
    is_pinned?: boolean;
    is_published?: boolean;
}) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from("notices")
        .insert({
            title: payload.title,
            content: payload.content ?? "",
            category: payload.category ?? "일반",
            is_pinned: !!payload.is_pinned,
            is_published: payload.is_published ?? true,
            created_at: now,
            updated_at: now,
        })
        .select("id")
        .single();

    if (error) throw error;
    return data as { id: string };
}

export async function updateNotice(
    id: string,
    patch: Partial<Pick<Notice, "title" | "content" | "category" | "is_pinned" | "is_published">>
) {
    const { error } = await supabase
        .from("notices")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) throw error;
    return true;
}

export async function deleteNotice(id: string) {
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) throw error;
    return true;
}
