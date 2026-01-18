import { redirect } from "react-router-dom";
import { authStore } from "../store/auth.store";

export async function adminOnlyGuard() {
    const { token } = authStore.getState();
    if (!token) throw redirect("/admin/login");
    return null;
}
