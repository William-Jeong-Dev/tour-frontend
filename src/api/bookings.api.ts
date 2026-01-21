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
      products:product_id (
        id, title, region, thumbnail_path, thumbnail_url
      )
    `)
        .eq("user_id", user_id)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

// 관리자용: 전체 예약 목록
export async function getAdminBookings(status?: BookingStatus) {
    let q = supabase
        .from("bookings")
        .select(`
      id, status, travel_date, people_count,
      contact_name, contact_phone, memo_user, memo_admin, created_at,
      products:product_id ( id, title, region, thumbnail_path, thumbnail_url ),
      profiles:user_id ( user_id, email, name, phone )
    `)
        .order("created_at", { ascending: false });

    if (status) q = q.eq("status", status);

    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
}

export async function updateBookingAdmin(
    booking_id: string,
    patch: { status?: BookingStatus; memo_admin?: string | null }
) {
    const { data, error } = await supabase
        .from("bookings")
        .update(patch)
        .eq("id", booking_id)
        .select("id")
        .single();

    if (error) throw error;
    return data;
}
