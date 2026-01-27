import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listThemesActive, type ThemeRow } from "../../api/themes.api";
import { useSession } from "../../hooks/useSession";
import { useLogoUrl, usePrimaryColor } from "../../hooks/useSiteBranding";

import KakaoLogo from "../../assets/kakao.png";
import InstaIcon from "../../assets/insta.png";
import BlogIcon from "../../assets/blog.png";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { session } = useSession();

    const themesQuery = useQuery({
        queryKey: ["themes", "active"],
        queryFn: listThemesActive,
        staleTime: 60_000,
    });

    const logoQuery = useLogoUrl();
    const logoUrl = logoQuery.data ?? "";

    const primaryColorQuery = usePrimaryColor();
    const primaryColor = primaryColorQuery.data || "#2E97F2";

    const themes: ThemeRow[] = useMemo(() => {
        const list = (themesQuery.data ?? []) as ThemeRow[];
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
        <header className={`sticky top-0 z-50 ${scrolled ? "shadow-md" : ""}`} style={{ backgroundColor: primaryColor }}>
            {/* ✅ Topbar: 2줄 (윗줄 메뉴 + 로고줄(우측 카카오)) */}
            <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
                {/* ✅ (PC만) 로고 위 공간: 우측 정렬 메뉴 */}
                <div className="hidden md:flex items-center justify-end gap-4 pt-3 pb-2 text-xs font-semibold text-white/90">
                    <Link to="/events" className="hover:text-white">
                        기획전/이벤트
                    </Link>
                    <Link to="/notices" className="hover:text-white">
                        공지사항
                    </Link>
                    <Link to="/faq" className="hover:text-white">
                        고객센터
                    </Link>

                    {session ? (
                        <Link to="/me" className="rounded-full bg-white/10 px-3 py-1 hover:bg-white/15">
                            마이메뉴 ▾
                        </Link>
                    ) : (
                        <Link to="/login" className="rounded-full bg-white/10 px-3 py-1 hover:bg-white/15">
                            로그인
                        </Link>
                    )}
                </div>

                {/* ✅ 로고 줄: 가운데 메인 로고 + (PC) 우측 카카오 로고 + (모바일) 우측 액션 */}
                <div className="relative flex items-center justify-between pt-4 pb-6 md:pt-4 md:pb-10">
                {/* 좌측 스페이서(PC에서 중앙정렬 안정화) */}
                    <div className="hidden md:block w-[260px]" aria-hidden="true" />

                    {/* ✅ 가운데 로고 (absolute center) */}
                    <Link
                        to="/"
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                        aria-label="홈으로"
                    >
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt="청원여행사"
                                className="h-11 md:h-20 w-auto max-w-[240px] md:max-w-[420px] object-contain"
                                loading="eager"
                            />
                        ) : (
                            <div className="leading-tight text-white text-center">
                                <div className="text-base md:text-lg font-extrabold">청원여행사</div>
                                <div className="text-xs font-semibold text-white/80">청원 여행사 스타일 데모</div>
                            </div>
                        )}
                    </Link>

                    {/* ✅ (PC만) 로고 줄 우측: SNS 아이콘 (우측 정렬) */}
                    <div className="hidden md:flex w-[260px] items-center justify-end">
                        <div className="flex items-center gap-3">
                            {/* Kakao */}
                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="inline-flex items-center justify-center"
                                aria-label="카카오톡"
                                title="카카오톡"
                            >
                                <img src={KakaoLogo} alt="KakaoTalk" className="h-7 w-auto opacity-90 hover:opacity-100" loading="eager" />
                            </a>

                            {/* Instagram */}
                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="inline-flex items-center justify-center"
                                aria-label="인스타그램"
                                title="인스타그램"
                            >
                                <img src={InstaIcon} alt="Instagram" className="h-7 w-7 object-contain opacity-90 hover:opacity-100" loading="eager" />
                            </a>

                            {/* Blog */}
                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="inline-flex items-center justify-center"
                                aria-label="블로그"
                                title="블로그"
                            >
                                <img src={BlogIcon} alt="Blog" className="h-7 w-7 object-contain opacity-90 hover:opacity-100" loading="eager" />
                            </a>
                        </div>
                    </div>

                    {/* ✅ 모바일 액션 (우측) */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            type="button"
                            onClick={() => navigate("/support")}
                            className="whitespace-nowrap rounded-full bg-yellow-400 px-3 py-2 text-xs font-extrabold text-neutral-900 hover:bg-yellow-300"
                        >
                            상담
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/notices")}
                            className="whitespace-nowrap rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15"
                        >
                            공지
                        </button>

                        {session ? (
                            <Link to="/me" className="whitespace-nowrap rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15">
                                마이
                            </Link>
                        ) : (
                            <Link to="/login" className="whitespace-nowrap rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15">
                                로그인
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ Category bar (왼쪽 카테고리 + 우측 검색/상담(PC)) */}
            <div>
                <nav className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
                    <div className="flex items-center gap-4 pt-5 pb-3">
                    {/* 왼쪽: 카테고리 (남는 공간을 먹게) */}
                        <div
                            className={[
                                "min-w-0 flex-1 flex items-center gap-3 overflow-x-auto text-sm font-semibold",
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
                                                active ? "bg-white text-[#2E97F2]" : "text-white/95 hover:bg-white/10",
                                            ].join(" ")}
                                        >
                                            {t.name}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* 오른쪽: 검색 + 상담 (우측 끝으로 밀기) */}
                        <div className="hidden md:flex items-center gap-3 shrink-0 ml-auto justify-end">
                            <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-white/90">
                                <span className="text-sm">🔍</span>
                                <input
                                    className="w-[300px] bg-transparent text-sm placeholder:text-white/70 focus:outline-none"
                                    placeholder="검색어를 입력하세요"
                                />
                            </div>

                            <button className="whitespace-nowrap rounded-full bg-yellow-400 px-5 py-2 text-sm font-extrabold text-neutral-900 hover:bg-yellow-300">
                                상담하기
                            </button>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
}