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
        <header
            className={`sticky top-0 z-50 ${scrolled ? "shadow-md" : ""}`}
            style={{ backgroundColor: primaryColor }}
        >
            <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
                {/* =======================
            (모바일) 1줄: 상담/공지/로그인 + SNS
           ======================= */}
                <div className="flex items-center justify-between pt-3 pb-2 md:hidden">
                    {/* 좌측: 상담/공지 */}
                    <div className="flex items-center gap-2">
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
                    </div>

                    {/* 우측: SNS + 로그인/마이 */}
                    <div className="flex items-center gap-2">
                        <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            aria-label="카카오톡"
                            title="카카오톡"
                            className="inline-flex h-9 w-9 items-center justify-center"
                        >
                            <img
                                src={KakaoLogo}
                                alt="KakaoTalk"
                                className="h-6 w-6 object-contain opacity-95"
                                loading="eager"
                            />
                        </a>

                        <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            aria-label="인스타그램"
                            title="인스타그램"
                            className="inline-flex h-9 w-9 items-center justify-center"
                        >
                            <img
                                src={InstaIcon}
                                alt="Instagram"
                                className="h-6 w-6 object-contain opacity-95"
                                loading="eager"
                            />
                        </a>

                        <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            aria-label="블로그"
                            title="블로그"
                            className="inline-flex h-9 w-9 items-center justify-center"
                        >
                            <img
                                src={BlogIcon}
                                alt="Blog"
                                className="h-6 w-6 object-contain opacity-95"
                                loading="eager"
                            />
                        </a>

                        {session ? (
                            <Link
                                to="/me"
                                className="whitespace-nowrap rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15"
                            >
                                마이
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="whitespace-nowrap rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15"
                            >
                                로그인
                            </Link>
                        )}
                    </div>
                </div>

                {/* =======================
            (PC) 1줄: 로고 위 우측 메뉴 (현재 안 보이던 부분)
           ======================= */}
                <div className="hidden md:flex items-center justify-end gap-4 pt-3 pb-2 text-sm font-semibold text-white/90">
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

                {/* =======================
            2줄: 로고 영역
            - 모바일: 가운데 정렬(absolute 사용 X) => 겹침 방지
            - PC: absolute center + 좌/우 스페이서
           ======================= */}
                <div className="relative flex items-center justify-between pt-3 pb-6 md:pt-4 md:pb-10">
                    {/* PC 좌측 스페이서 */}
                    <div className="hidden md:block w-[260px]" aria-hidden="true" />

                    {/* 로고 */}
                    <Link
                        to="/"
                        aria-label="홈으로"
                        className={[
                            "flex items-center justify-center",
                            "md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
                            "w-full md:w-auto",
                        ].join(" ")}
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

                    {/* PC 우측: SNS 아이콘 (오른쪽 여백 추가 pr-2) */}
                    <div className="hidden md:flex w-[260px] items-center justify-end pr-2">
                        <div className="flex items-center gap-3">
                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="inline-flex items-center justify-center"
                                aria-label="카카오톡"
                                title="카카오톡"
                            >
                                <img
                                    src={KakaoLogo}
                                    alt="KakaoTalk"
                                    className="h-7 w-7 object-contain opacity-90 hover:opacity-100"
                                    loading="eager"
                                />
                            </a>

                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="inline-flex items-center justify-center"
                                aria-label="인스타그램"
                                title="인스타그램"
                            >
                                <img
                                    src={InstaIcon}
                                    alt="Instagram"
                                    className="h-7 w-7 object-contain opacity-90 hover:opacity-100"
                                    loading="eager"
                                />
                            </a>

                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="inline-flex items-center justify-center"
                                aria-label="블로그"
                                title="블로그"
                            >
                                <img
                                    src={BlogIcon}
                                    alt="Blog"
                                    className="h-7 w-7 object-contain opacity-90 hover:opacity-100"
                                    loading="eager"
                                />
                            </a>
                        </div>
                    </div>

                    {/* 모바일에서는 로고 줄 좌/우 요소 제거(겹침 방지) */}
                    <div className="md:hidden w-0" aria-hidden="true" />
                </div>
            </div>

            {/* =======================
          3줄: 카테고리 + (PC) 검색/상담
         ======================= */}
            <div>
                <nav className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
                    <div className="flex items-center gap-4 pt-4 pb-3 md:pt-5">
                        {/* 카테고리 */}
                        <div
                            className={[
                                "min-w-0 flex-1 flex items-center gap-3 overflow-x-auto",
                                "text-base md:text-sm font-semibold", // 모바일 글자 좀 더 큼
                                "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                            ].join(" ")}
                        >
                            {themesQuery.isLoading ? (
                                <div className="text-white/80 text-sm">테마 불러오는 중...</div>
                            ) : themes.length === 0 ? (
                                <div className="text-white/80 text-sm">
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

                        {/* PC 검색/상담 */}
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