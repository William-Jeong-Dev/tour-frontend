import { supabase } from "../lib/supabase";

export type AdminUserRow = {
    user_id: string;
    email: string | null;
    name: string | null;
    phone: string | null;
    country_code: string | null;
    preferred_lang: string | null;
    marketing_opt_in: boolean;
    created_at: string;

    booking_count: number;
    favorite_count: number;
    last_booking_at: string | null;
};

export type AdminUsersSummary = {
    total_users: number;
    today_new_users: number;
    marketing_opt_in_users: number;
};

export type AdminUserProfile = {
    user_id: string;
    email: string | null;
    name: string | null;
    phone: string | null;
    birth_date: string | null;
    country_code: string | null;
    preferred_lang: string | null;
    marketing_opt_in: boolean;
    marketing_opt_in_at: string | null;
    created_at: string;
    updated_at: string;
};

export type AdminUserBookingRow = {
    id: string;
    product_id: string;
    product_title: string;
    status: string;
    travel_date: string | null;
    people_count: number;
    contact_name: string | null;
    contact_phone: string | null;
    memo_user: string | null;
    memo_admin: string | null;
    created_at: string;
    updated_at: string;
};

export type AdminUserFavoriteRow = {
    id: string;
    product_id: string;
    product_title: string;
    created_at: string;
};

export async function fetchAdminUsersSummary(): Promise<AdminUsersSummary> {
    const { data, error } = await supabase.rpc("admin_users_summary");
    if (error) throw error;

    const row = (data?.[0] ?? null) as any;
    return {
        total_users: Number(row?.total_users ?? 0),
        today_new_users: Number(row?.today_new_users ?? 0),
        marketing_opt_in_users: Number(row?.marketing_opt_in_users ?? 0),
    };
}

/**
 * 회원 목록 (기본: 최신순)
 * - 검색(q): email/name/phone 부분검색
 * - limit/offset 지원
 * - booking_count/favorite_count/last_booking_at 집계 포함
 */
export async function listAdminUsers(params: { q?: string; limit?: number; offset?: number } = {}) {
    const q = (params.q ?? "").trim();
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    // profiles 기본 조회
    let query = supabase
        .from("profiles")
        .select("user_id,email,name,phone,country_code,preferred_lang,marketing_opt_in,created_at")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (q) {
        // or 조건
        query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%,phone.ilike.%${q}%`);
    }

    const { data: profiles, error } = await query;
    if (error) throw error;

    const userIds = (profiles ?? []).map((x) => x.user_id);
    if (userIds.length === 0) {
        return [] as AdminUserRow[];
    }

    // bookings 집계
    const { data: bookingsAgg, error: e2 } = await supabase
        .from("bookings")
        .select("user_id, created_at")
        .in("user_id", userIds);
    if (e2) throw e2;

    // favorites 집계
    const { data: favAgg, error: e3 } = await supabase
        .from("product_favorites")
        .select("user_id, created_at")
        .in("user_id", userIds);
    if (e3) throw e3;

    const bookingMap = new Map<string, { count: number; last: string | null }>();
    for (const b of bookingsAgg ?? []) {
        const prev = bookingMap.get(b.user_id) ?? { count: 0, last: null };
        prev.count += 1;
        const ts = b.created_at as string;
        if (!prev.last || new Date(ts) > new Date(prev.last)) prev.last = ts;
        bookingMap.set(b.user_id, prev);
    }

    const favMap = new Map<string, number>();
    for (const f of favAgg ?? []) {
        favMap.set(f.user_id, (favMap.get(f.user_id) ?? 0) + 1);
    }

    return (profiles ?? []).map((p) => {
        const b = bookingMap.get(p.user_id);
        return {
            ...p,
            booking_count: b?.count ?? 0,
            favorite_count: favMap.get(p.user_id) ?? 0,
            last_booking_at: b?.last ?? null,
        } as AdminUserRow;
    });
}

export async function getAdminUserProfile(userId: string): Promise<AdminUserProfile | null> {
    const { data, error } = await supabase
        .from("profiles")
        .select(
            "user_id,email,name,phone,birth_date,country_code,preferred_lang,marketing_opt_in,marketing_opt_in_at,created_at,updated_at"
        )
        .eq("user_id", userId)
        .maybeSingle();

    if (error) throw error;
    return (data ?? null) as any;
}

export async function listAdminUserBookings(userId: string): Promise<AdminUserBookingRow[]> {
    const { data, error } = await supabase
        .from("bookings")
        .select(
            "id,user_id,product_id,status,travel_date,people_count,contact_name,contact_phone,memo_user,memo_admin,created_at,updated_at, products(title)"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) throw error;

    return (data ?? []).map((x: any) => ({
        id: x.id,
        product_id: x.product_id,
        product_title: x.products?.title ?? "",
        status: x.status,
        travel_date: x.travel_date,
        people_count: x.people_count,
        contact_name: x.contact_name,
        contact_phone: x.contact_phone,
        memo_user: x.memo_user,
        memo_admin: x.memo_admin,
        created_at: x.created_at,
        updated_at: x.updated_at,
    }));
}

export async function listAdminUserFavorites(userId: string): Promise<AdminUserFavoriteRow[]> {
    const { data, error } = await supabase
        .from("product_favorites")
        .select("id,user_id,product_id,created_at, products(title)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) throw error;

    return (data ?? []).map((x: any) => ({
        id: x.id,
        product_id: x.product_id,
        product_title: x.products?.title ?? "",
        created_at: x.created_at,
    }));
}