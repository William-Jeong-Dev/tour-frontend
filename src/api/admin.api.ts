import { supabase } from "../lib/supabase";

export async function isAdmin(userId: string) {
    const { data } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();
    return !!data;
}
