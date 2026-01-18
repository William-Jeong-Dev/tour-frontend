import { NavLink, useNavigate } from "react-router-dom";
import { authStore } from "../../store/auth.store";

export default function AdminSideNav() {
    const nav = useNavigate();
    const logout = authStore((s) => s.logout);

    return (
        <aside className="rounded-3xl border border-neutral-900 bg-neutral-900/20 p-5">
            <div className="text-sm font-semibold">Admin</div>

            <div className="mt-4 space-y-2 text-sm">
                <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                        `block rounded-xl px-3 py-2 ${isActive ? "bg-neutral-50 text-neutral-950" : "text-neutral-200 hover:bg-neutral-900"}`
                    }
                >
                    대시보드
                </NavLink>

                <NavLink
                    to="/admin/products"
                    className={({ isActive }) =>
                        `block rounded-xl px-3 py-2 ${isActive ? "bg-neutral-50 text-neutral-950" : "text-neutral-200 hover:bg-neutral-900"}`
                    }
                >
                    상품 관리
                </NavLink>
            </div>

            <button
                onClick={() => {
                    logout();
                    nav("/admin/login");
                }}
                className="mt-6 w-full rounded-xl border border-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
            >
                로그아웃
            </button>
        </aside>
    );
}
