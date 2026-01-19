import { redirect } from "react-router-dom";
import { isAdmin } from "../lib/supabase";

/**
 * /admin 라우트 loader로 사용.
 * - 로그인 세션이 없거나
 * - admin_users에 등록된 관리자가 아니면
 *   -> /admin/login 으로 리다이렉트
 */
export async function adminOnlyGuard() {
    const ok = await isAdmin();
    if (!ok) {
        throw redirect("/admin/login");
    }
    return null;
}
