import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listThemesActive, type ThemeRow } from "../../api/themes.api";


export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    const themesQuery = useQuery({
        queryKey: ["themes", "active"],
        queryFn: listThemesActive,
        staleTime: 60_000,
    });


    // ✅ 타입을 정확히: ThemeRow[]
    const themes: ThemeRow[] = useMemo(() => {
        const list = (themesQuery.data ?? []) as ThemeRow[];

        // active만 + 정렬(있으면 sort_order 우선)
        return [...list]
            .filter((t) => t.is_active !== false)
            .sort((a, b) => {
                const ao = a.sort_order ?? 9999;
                const bo = b.sort_order ?? 9999;
                if (ao !== bo) return ao - bo;
                return (a.name ?? "").localeCompare(b.name ?? "");
            });
    }, [themesQuery.data]);



    const [activeTheme, setActiveTheme] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 4);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // ✅ URL이 /theme/:slug 인 경우 active 동기화
    useEffect(() => {
        const seg = location.pathname.split("/").filter(Boolean);
        if (seg[0] !== "theme") {
            setActiveTheme(null);
            return;
        }
        const slug = seg[1] ?? "";
        const found = themes.find((t) => t.slug === slug);
        setActiveTheme(found?.slug ?? null);
    }, [location.pathname, themes]);

    const onClickTheme = (slug: string) => {
        setActiveTheme(slug);
        navigate(`/theme/${slug}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <header className={`sticky top-0 z-50 bg-[#1C8B7B] ${scrolled ? "shadow-md" : ""}`}>
            {/* 상단 라인 */}
            <div className="border-b border-white/15">
                <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 md:px-6">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/95" />
                        <div className="leading-tight text-white">
                            <div className="text-base font-extrabold">비범 투어</div>
                            <div className="text-xs font-semibold text-white/80">비범투어 스타일 데모</div>
                        </div>
                    </Link>

                    <div className="hidden items-center gap-3 md:flex">
                        <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-white/90">
                            <span className="text-sm">🔍</span>
                            <input
                                className="w-[360px] bg-transparent text-sm placeholder:text-white/70 focus:outline-none"
                                placeholder="검색어를 입력하세요"
                            />
                        </div>

                        <button className="rounded-full bg-yellow-400 px-5 py-2 text-sm font-extrabold text-neutral-900 hover:bg-yellow-300">
                            상담하기
                        </button>
                    </div>

                    <div className="hidden items-center gap-4 text-xs font-semibold text-white/90 md:flex">
                        <Link to="/events" className="hover:text-white">
                            기획전/이벤트
                        </Link>
                        <Link to="/notice" className="hover:text-white">
                            공지사항
                        </Link>
                        <Link to="/support" className="hover:text-white">
                            고객센터
                        </Link>
                        <div className="rounded-full bg-white/10 px-3 py-1">마이메뉴 ▾</div>
                    </div>
                </div>
            </div>

            {/* ✅ 카테고리 라인: Admin 테마 관리에서 불러온 themes로 렌더 */}
            <div className="border-b border-white/15">
                <nav className="mx-auto w-full max-w-[1400px] px-0 md:px-6">
                    <div
                        className={[
                            "flex items-center gap-3 overflow-x-auto py-3 text-sm font-semibold",
                            "px-4 md:px-0",
                            "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                        ].join(" ")}
                    >
                        {themesQuery.isLoading ? (
                            <div className="text-white/80 text-xs">테마 불러오는 중...</div>
                        ) : themes.length === 0 ? (
                            <div className="text-white/80 text-xs">
                                활성화된 테마가 없습니다. (Admin &gt; 테마 관리에서 active 확인)
                            </div>
                        ) : (
                            themes.map((t: ThemeRow) => {
                                const active = activeTheme === t.slug;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => onClickTheme(t.slug)}
                                        className={[
                                            "shrink-0 rounded-full px-4 py-2 transition",
                                            active ? "bg-white text-[#1C8B7B]" : "text-white/95 hover:bg-white/10",
                                        ].join(" ")}
                                    >
                                        {t.name}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
