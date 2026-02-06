import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
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

    const [params] = useSearchParams();
    const initialQ = params.get("q") ?? "";

    const [q, setQ] = useState(initialQ);

    useEffect(() => {
        setQ(initialQ);
    }, [initialQ]);

    const goSearch = () => {
        const keyword = q.trim();
        navigate(keyword ? `/search?q=${encodeURIComponent(keyword)}` : `/search`);
    };

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

    const disabledSearch = !q.trim();

    return (
        <header
            className={`sticky top-0 z-50 ${scrolled ? "shadow-md" : ""}`}
            style={{ backgroundColor: primaryColor }}
        >
            <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
                {/* =======================
            (모바일) 1줄: 상담/공지/로그인 + SNS
           ======================= */}
                <div className="relative z-30 flex items-center justify-between pt-3 pb-2 md:hidden">
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
                        {/* Kakao (링크 생기면 href만 교체) */}
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

                        {/* Instagram ✅ */}
                        <a
                            href="https://www.instagram.com/chungwon.tour/"
                            target="_blank"
                            rel="noopener noreferrer"
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

                        {/* Blog ✅ */}
                        <a
                            href="https://blog.naver.com/chungwon87"
                            target="_blank"
                            rel="noopener noreferrer"
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
                            "w-auto",
                            "md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
                            "pointer-events-auto",
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

                    {/* PC 우측: SNS */}
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
                                href="https://www.instagram.com/chungwon.tour/"
                                target="_blank"
                                rel="noopener noreferrer"
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
                                href="https://blog.naver.com/chungwon87"
                                target="_blank"
                                rel="noopener noreferrer"
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

                    <div className="md:hidden w-0" aria-hidden="true" />
                </div>
            </div>

            {/* =======================
          3줄: 카테고리 + (PC) 검색/상담
          + (모바일) 검색/버튼 추가 ✅
         ======================= */}
            <div>
                <nav className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
                    <div className="flex flex-col gap-3 pt-4 pb-3 md:flex-row md:items-center md:gap-4 md:pt-5">
                        {/* 카테고리 */}
                        <div
                            className={[
                                "min-w-0 flex-1 flex items-center gap-3 overflow-x-auto",
                                "text-[15px] sm:text-base md:text-[16px] font-semibold",
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
                                                "shrink-0 rounded-full transition",
                                                "px-5 py-2.5 md:px-6 md:py-3",
                                                "text-[15px] sm:text-base md:text-[16px]",
                                                active ? "bg-white text-[#2E97F2]" : "text-white/95 hover:bg-white/10",
                                            ].join(" ")}
                                        >
                                            {t.name}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* ✅ PC 검색/상담 */}
                        <div className="hidden md:flex items-center gap-3 shrink-0 ml-auto justify-end">
                            <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-white/90">
                                <span className="text-sm">🔍</span>
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    className="w-[300px] bg-transparent text-sm placeholder:text-white/70 focus:outline-none"
                                    placeholder="검색어를 입력하세요"
                                    inputMode="search"
                                    enterKeyHint="search"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") goSearch();
                                    }}
                                />
                            </div>

                            <button
                                type="button"
                                className="whitespace-nowrap rounded-full bg-yellow-400 px-5 py-2 text-sm font-extrabold text-neutral-900 hover:bg-yellow-300"
                                onClick={() => navigate("/estimate")}
                            >
                                1:1 맞춤견적
                            </button>
                        </div>

                        {/* ✅ 모바일 검색/상담 (버튼 포함) */}
                        <div className="flex md:hidden items-center gap-2">
                            <div className="flex flex-1 items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-white/90">
                                <span className="text-sm">🔍</span>
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    className="min-w-0 flex-1 bg-transparent text-sm placeholder:text-white/70 focus:outline-none"
                                    placeholder="검색어를 입력하세요"
                                    inputMode="search"
                                    enterKeyHint="search"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") goSearch();
                                    }}
                                />

                                {/* ✅ 모바일 전용 검색 버튼 */}
                                <button
                                    type="button"
                                    onClick={goSearch}
                                    disabled={disabledSearch}
                                    aria-label="검색"
                                    className={[
                                        "grid h-8 w-8 place-items-center rounded-full",
                                        "bg-white/20 text-white hover:bg-white/30 active:scale-[0.98]",
                                        disabledSearch ? "opacity-50 cursor-not-allowed" : "",
                                    ].join(" ")}
                                >
                                    🔎
                                </button>
                            </div>

                            <button
                                type="button"
                                className="whitespace-nowrap rounded-full bg-yellow-400 px-4 py-2 text-sm font-extrabold text-neutral-900 hover:bg-yellow-300"
                                onClick={() => navigate("/estimate")}
                            >
                                1:1 맞춤견적
                            </button>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
}