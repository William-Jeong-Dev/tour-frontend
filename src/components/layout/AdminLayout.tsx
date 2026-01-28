import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "../../lib/supabase";

function cx(...arr: Array<string | false | null | undefined>) {
    return arr.filter(Boolean).join(" ");
}

const NAVS = [
    { to: "/admin", label: "대시보드", end: true },
    { to: "/admin/hero-slides", label: "히어로 슬라이드" }, // ✅ 추가
    { to: "/admin/products", label: "상품 관리" },
    { to: "/admin/themes", label: "테마 관리" },
    { to: "/admin/bookings", label: "예약 현황" },
    { to: "/admin/notices", label: "공지사항" },
    { to: "/admin/settings/branding", label: "브랜딩(로고)" },
    { to: "/admin/users", label: "회원 현황" },
];

export default function AdminLayout() {
    const nav = useNavigate();
    const loc = useLocation();
    const [open, setOpen] = useState(false);

    const activeLabel = useMemo(() => {
        const hit = NAVS.find((x) =>
            x.end ? loc.pathname === x.to : loc.pathname.startsWith(x.to)
        );
        return hit?.label ?? "Admin";
    }, [loc.pathname]);

    const onLogout = async () => {
        await signOut();
        nav("/admin/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-black text-neutral-100">
            {/* ✅ Mobile Topbar */}
            <div className="sticky top-0 z-40 border-b border-neutral-900 bg-black/80 backdrop-blur lg:hidden">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm font-semibold text-neutral-200"
                    >
                        ☰ <span className="text-xs text-neutral-300">메뉴</span>
                    </button>

                    <div className="min-w-0 text-center">
                        <div className="truncate text-sm font-extrabold">{activeLabel}</div>
                        <div className="text-[11px] text-neutral-400">Tour Admin</div>
                    </div>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm font-semibold text-neutral-200"
                    >
                        로그아웃
                    </button>
                </div>
            </div>

            {/* ✅ Mobile Drawer Sidebar */}
            {open ? (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setOpen(false)}
                        aria-hidden="true"
                    />
                    <aside className="absolute left-0 top-0 h-full w-[86%] max-w-[320px] border-r border-neutral-900 bg-neutral-950 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="px-1">
                                <div className="text-sm font-extrabold text-neutral-100">Admin</div>
                                <div className="mt-1 text-xs text-neutral-400">
                                    상품/콘텐츠 데이터를 관리합니다
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm font-semibold text-neutral-200"
                            >
                                닫기
                            </button>
                        </div>

                        <nav className="mt-4 space-y-2">
                            {NAVS.map((x) => (
                                <MenuLink
                                    key={x.to}
                                    to={x.to}
                                    label={x.label}
                                    end={Boolean(x.end)}
                                    onClick={() => setOpen(false)}
                                />
                            ))}
                        </nav>

                        <div className="mt-4 border-t border-neutral-900 pt-4">
                            <button
                                type="button"
                                onClick={onLogout}
                                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm font-extrabold text-neutral-200 hover:bg-neutral-900"
                            >
                                로그아웃
                            </button>
                        </div>
                    </aside>
                </div>
            ) : null}

            {/* ✅ Desktop layout */}
            <div className="mx-auto max-w-6xl px-4 py-6">
                <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                    {/* Sidebar (desktop only) */}
                    <aside className="hidden rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4 lg:block">
                        <div className="px-2 pb-3">
                            <div className="text-sm font-extrabold text-neutral-200">Admin</div>
                            <div className="mt-1 text-xs text-neutral-400">
                                상품/콘텐츠 데이터를 관리합니다
                            </div>
                        </div>

                        <nav className="mt-2 space-y-2">
                            {NAVS.map((x) => (
                                <MenuLink key={x.to} to={x.to} label={x.label} end={Boolean(x.end)} />
                            ))}
                        </nav>

                        <div className="mt-4 border-t border-neutral-900 pt-4">
                            <button
                                type="button"
                                onClick={onLogout}
                                className="w-full rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-2 text-sm font-extrabold text-neutral-200 hover:bg-neutral-900"
                            >
                                로그아웃
                            </button>
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="rounded-2xl border border-neutral-900 bg-neutral-950/30 p-4 sm:p-5">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}

function MenuLink({
                      to,
                      label,
                      end,
                      onClick,
                  }: {
    to: string;
    label: string;
    end?: boolean;
    onClick?: () => void;
}) {
    return (
        <NavLink
            to={to}
            end={end}
            onClick={onClick}
            className={({ isActive }) =>
                cx(
                    "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-extrabold transition",
                    isActive
                        ? "bg-neutral-50 text-neutral-950"
                        : "bg-neutral-950/40 text-neutral-200 hover:bg-neutral-900"
                )
            }
        >
            <span className="whitespace-nowrap">{label}</span>
        </NavLink>
    );
}
