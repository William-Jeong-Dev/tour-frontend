import { supabase } from "../lib/supabase";

export type BookingStatus = "REQUESTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type CreateBookingPayload = {
    product_id: string;
    travel_date?: string | null;   // "YYYY-MM-DD"
    people_count: number;
    contact_name?: string | null;
    contact_phone?: string | null;
    memo_user?: string | null;
};

export async function createBooking(user_id: string, payload: CreateBookingPayload) {
    const { data, error } = await supabase
        .from("bookings")
        .insert({
            user_id,
            ...payload,
            status: "REQUESTED",
        })
        .select("id")
        .single();

    if (error) throw error;
    return data; // { id }
}

export async function getMyBookings(user_id: string) {
    const { data, error } = await supabase
        .from("bookings")
        .select(`
      id, status, travel_date, people_count, created_at,
      products:product_id ( id, title, region, thumbnail_path, thumbnail_url )
    `)
        .eq("user_id", user_id)
        .neq("status", "CANCELLED")          // 취소건 제외
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
}


// 관리자용: 전체 예약 목록
export async function getAdminBookings(
    status?: BookingStatus,
    opts?: { limit?: number; offset?: number }
) {
    const limit = opts?.limit ?? 50;
    const offset = opts?.offset ?? 0;

    // ✅ count: exact 로 totalCount 받기
    let q = supabase
        .from("bookings")
        .select(
            `
      id,user_id,product_id,status,travel_date,people_count,memo_user,memo_admin,created_at,updated_at,
      products:products(id,title,region,thumbnail_path,thumbnail_url),
      profiles:profiles(user_id,email,name,phone)
    `,
            { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (status) q = q.eq("status", status);

    const { data, error, count } = await q;

    if (error) throw error;

    return { rows: data ?? [], count: count ?? 0 };
}


export async function updateBookingAdmin(
    bookingId: string,
    patch: { status?: BookingStatus; memo_admin?: string | null }
) {
    const { data, error } = await supabase
        .from("bookings")
        .update(patch)
        .eq("id", bookingId)
        .select("id")
        .single();

    if (error) throw error;
    return data;
}

export async function cancelMyBooking(bookingId: string, userId: string) {
    const { data, error } = await supabase
        .from("bookings")
        .update({ status: "CANCELLED" })
        .eq("id", bookingId)
        .eq("user_id", userId)
        .select("id")
        .single();

    if (error) throw error;
    return data;
}
