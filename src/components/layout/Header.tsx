import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const CATS = [
    "일본 골프",
    "겨울 골프",
    "특가 골프",
    "부산 출발",
    "동남아/중국/괌 골프",
    "내맘대로 DIY 골프",
    "골프여행 꿀팁",
    "1:1 견적문의",
];

export default function Header() {
    const [activeCat, setActiveCat] = useState<string>(CATS[0]);
    const [scrolled, setScrolled] = useState(false);

    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [q, setQ] = useState("");

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 6);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const headerClass = useMemo(() => {
        return [
            "sticky top-0 z-40 bg-[#1C8B7B] text-white",
            scrolled ? "shadow-lg shadow-black/10" : "",
        ].join(" ");
    }, [scrolled]);

    const onSubmitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: 검색 페이지/모달 연결 예정
        // 예) navigate(`/search?q=${encodeURIComponent(q)}`)
        console.log("search:", q);
    };

    return (
        <header className={headerClass}>
            {/* 상단 작은 메뉴 */}
            <div className="border-b border-white/15">
                <div className="mx-auto flex w-full max-w-[1400px] items-center justify-end gap-4 px-6 py-2 text-xs text-white/90">
                    <a className="hover:text-white/70" href="#event">
                        기획전/이벤트
                    </a>
                    <a className="hover:text-white/70" href="#notice">
                        공지사항
                    </a>
                    <a className="hover:text-white/70" href="#cs">
                        고객센터
                    </a>
                    <div className="relative">
                        <button className="hover:text-white/70" type="button">
                            마이메뉴 ▾
                        </button>
                    </div>
                </div>
            </div>

            {/* 로고 라인 */}
            <div className="border-b border-white/15">
                <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-6 py-4">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-white/95" />
                        <div className="leading-tight">
                            <div className="text-lg font-extrabold tracking-wide">비버 투어</div>
                            <div className="text-[11px] text-white/85">비버투어 스타일 데모</div>
                        </div>
                    </Link>

                    {/* Desktop Search */}
                    <form
                        onSubmit={onSubmitSearch}
                        className="hidden items-center gap-2 md:flex"
                    >
                        <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-2">
                            <span className="text-sm">🔍</span>
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="검색어를 입력하세요"
                                className="w-[260px] bg-transparent text-sm text-white placeholder:text-white/70 outline-none"
                            />
                        </div>
                    </form>

                    <div className="flex items-center gap-3">
                        {/* Mobile Search Toggle */}
                        <button
                            className="grid h-10 w-10 place-items-center rounded-full bg-white/15 hover:bg-white/25 md:hidden"
                            aria-label="search"
                            type="button"
                            onClick={() => setMobileSearchOpen((v) => !v)}
                        >
                            🔍
                        </button>

                        <Link
                            to="/"
                            className="rounded-full bg-yellow-400 px-4 py-2 text-xs font-bold text-neutral-900 hover:bg-yellow-300"
                        >
                            상담하기
                        </Link>
                    </div>
                </div>

                {/* Mobile Search Row */}
                {mobileSearchOpen ? (
                    <div className="md:hidden">
                        <div className="mx-auto w-full max-w-[1400px] px-6 pb-4">
                            <form onSubmit={onSubmitSearch} className="flex gap-2">
                                <div className="flex flex-1 items-center gap-2 rounded-2xl bg-white/15 px-3 py-3">
                                    <span className="text-sm">🔍</span>
                                    <input
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="검색어를 입력하세요"
                                        className="w-full bg-transparent text-sm text-white placeholder:text-white/70 outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="rounded-2xl bg-white/90 px-4 text-sm font-bold text-neutral-900"
                                >
                                    검색
                                </button>
                            </form>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* 카테고리 라인 */}
            <div className="border-b border-white/15">
                <nav className="mx-auto w-full max-w-[1400px] px-6">
                    <div className="flex items-center justify-center gap-7 overflow-x-auto py-3 text-sm font-semibold">
                        {CATS.map((t) => {
                            const isActive = activeCat === t;
                            return (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setActiveCat(t)}
                                    className={[
                                        "whitespace-nowrap rounded-full px-3 py-1 transition",
                                        isActive
                                            ? "bg-white/20 text-white"
                                            : "text-white/90 hover:text-white hover:bg-white/10",
                                    ].join(" ")}
                                >
                                    {t}
                                </button>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </header>
    );
}
