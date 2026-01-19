import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { authStore } from "../../store/auth.store";

function cx(...arr: Array<string | false | null | undefined>) {
    return arr.filter(Boolean).join(" ");
}

export default function AdminLayout() {
    const nav = useNavigate();
    const { logout } = authStore();

    const onLogout = () => {
        logout();
        nav("/admin/login");
    };

    return (
        <div className="min-h-screen bg-black text-neutral-100">
            <div className="mx-auto max-w-6xl px-4 py-6">
                <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                    {/* Sidebar */}
                    <aside className="rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
                        <div className="px-2 pb-3">
                            <div className="text-sm font-semibold text-neutral-200">Admin</div>
                            <div className="mt-1 text-xs text-neutral-400">상품/예약 데이터를 관리합니다</div>
                        </div>

                        <nav className="mt-2 space-y-2">
                            <MenuLink to="/admin" label="대시보드" />
                            <MenuLink to="/admin/products" label="상품 관리" />
                            {/* 다음에 예약/고객 추가될 자리 */}
                            {/* <MenuLink to="/admin/bookings" label="예약 관리" /> */}
                        </nav>

                        <div className="mt-4 border-t border-neutral-900 pt-4">
                            <button
                                type="button"
                                onClick={onLogout}
                                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-900"
                            >
                                로그아웃
                            </button>
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="rounded-2xl border border-neutral-900 bg-neutral-950/30 p-5">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}

function MenuLink({ to, label }: { to: string; label: string }) {
    return (
        <NavLink
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
                cx(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition",
                    isActive
                        ? "bg-neutral-50 text-neutral-950"
                        : "bg-neutral-950/40 text-neutral-200 hover:bg-neutral-900"
                )
            }
        >
            <span>{label}</span>
        </NavLink>
    );
}
