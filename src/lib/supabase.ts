import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        "[supabase] env missing: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 를 설정했는지 확인하세요."
    );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");

export async function getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session ?? null;
}

export async function signOut() {
    await supabase.auth.signOut();
}

/**
 * admin 여부 확인 (화이트리스트 방식)
 * - admin_users 테이블에 내 user_id가 있으면 관리자
 */
export async function isAdmin(): Promise<boolean> {
    const session = await getSession();
    const uid = session?.user?.id;
    if (!uid) return false;

    const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", uid)
        .maybeSingle();

    if (error) {
        console.warn("[isAdmin] error:", error.message);
        return false;
    }
    return Boolean(data?.user_id);
}
