import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import Container from "../../components/common/Container";

type Card = {
    id: string;
    title: string;
    price: string;
    img: string;
    badge?: string;
};

type EventItem = {
    id: string;
    dateISO: string; // YYYY-MM-DD
    label: string; // 표시용
    status: "예약가능" | "가격문의" | "출발확정";
    priceAdult: number; // 원 단위
};

type TabKey =
    | "select"
    | "itinerary"
    | "summary"
    | "info"
    | "schedule"
    | "policy";

function krw(n: number) {
    return n.toLocaleString("ko-KR");
}

function toISODate(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function addMonths(base: Date, delta: number) {
    const d = new Date(base);
    d.setMonth(d.getMonth() + delta);
    return d;
}

function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function getMonthMatrix(monthDate: Date) {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);

    // 일(0)~토(6)
    const startWeekday = start.getDay();
    const totalDays = end.getDate();

    // 6주(42칸) 고정 그리드
    const cells: Array<{ date: Date | null }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ date: null });
    for (let day = 1; day <= totalDays; day++) {
        cells.push({ date: new Date(start.getFullYear(), start.getMonth(), day) });
    }
    while (cells.length < 42) cells.push({ date: null });

    return { start, end, cells };
}

function useActiveSection(keys: TabKey[]) {
    const [active, setActive] = useState<TabKey>(keys[0]);
    const refs = useRef<Record<TabKey, HTMLElement | null>>(
        keys.reduce((acc, k) => ({ ...acc, [k]: null }), {} as any)
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // 가장 위에 가까운/가장 많이 보이는 섹션을 active로
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
                if (visible[0]?.target?.id) setActive(visible[0].target.id as TabKey);
            },
            {
                root: null,
                // 헤더 sticky 높이 감안해서 위쪽에서 조금 지나면 교체
                rootMargin: "-120px 0px -65% 0px",
                threshold: [0.1, 0.2, 0.35, 0.5],
            }
        );

        keys.forEach((k) => {
            const el = refs.current[k];
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [keys]);

    return { active, refs };
}

function Badge({ children }: { children: string }) {
    return (
        <span className="inline-flex items-center rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-bold text-neutral-700">
            {children}
        </span>
    );
}

function StatusPill({ status }: { status: EventItem["status"] }) {
    const cls =
        status === "예약가능"
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : status === "출발확정"
                ? "bg-sky-50 text-sky-700 border-sky-100"
                : "bg-neutral-100 text-neutral-600 border-neutral-200";

    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${cls}`}>
            {status}
        </span>
    );
}

function QtyControl({
                        label,
                        value,
                        onChange,
                        hint,
                    }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    hint?: string;
}) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="text-xs font-semibold text-neutral-500">{label}</div>
            {hint ? <div className="mt-1 text-[11px] text-neutral-400">{hint}</div> : null}
            <div className="mt-3 flex items-center justify-between gap-3">
                <button
                    type="button"
                    className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-200 bg-white text-lg font-bold hover:bg-neutral-50"
                    onClick={() => onChange(Math.max(0, value - 1))}
                >
                    −
                </button>
                <div className="min-w-[44px] text-center text-base font-extrabold text-neutral-900">{value}</div>
                <button
                    type="button"
                    className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-200 bg-white text-lg font-bold hover:bg-neutral-50"
                    onClick={() => onChange(value + 1)}
                >
                    +
                </button>
            </div>
        </div>
    );
}

export default function ProductDetail() {
    const { id } = useParams();
    const location = useLocation();
    const product = (location.state as { product?: Card } | null)?.product;

    // ✅ 상세로 들어오면 “항상 맨 위”로
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }, [id]);

    // 데모 데이터(실제 API 붙이면 여기만 교체)
    const tags = useMemo(() => {
        // jiantour 화면처럼 상단에 “규슈골프/온천골프/1인1실” 느낌
        return product?.badge
            ? ["일본골프", "온천골프", product.badge]
            : ["일본골프", "온천골프", "1인1실"];
    }, [product]);

    const baseTitle =
        product?.title ??
        "[일본골프][사가] 이마리 실속 온천 골프(3일/36홀) #1인1실 #이마리시내호텔";

    const heroPriceText = product?.price ?? "649,000원 부터~";

    const heroImg =
        product?.img ??
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=80";

    // 출발일/행사(데모)
    const events: EventItem[] = useMemo(() => {
        return [
            { id: "e1", dateISO: "2026-01-28", label: "2026-01-28 (수)", status: "출발확정", priceAdult: 649000 },
            { id: "e2", dateISO: "2026-01-29", label: "2026-01-29 (목)", status: "예약가능", priceAdult: 649000 },
            { id: "e3", dateISO: "2026-01-30", label: "2026-01-30 (금)", status: "예약가능", priceAdult: 769000 },
            { id: "e4", dateISO: "2026-02-01", label: "2026-02-01 (일)", status: "예약가능", priceAdult: 699000 },
            { id: "e5", dateISO: "2026-02-09", label: "2026-02-09 (월)", status: "가격문의", priceAdult: 0 },
        ];
    }, []);

    const eventByDate = useMemo(() => {
        const m = new Map<string, EventItem[]>();
        events.forEach((e) => {
            const list = m.get(e.dateISO) ?? [];
            list.push(e);
            m.set(e.dateISO, list);
        });
        return m;
    }, [events]);

    const [selectedDateISO, setSelectedDateISO] = useState<string>(events[0]?.dateISO ?? toISODate(new Date()));
    const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id ?? "");
    const selectedEvent = useMemo(
        () => events.find((e) => e.id === selectedEventId) ?? null,
        [events, selectedEventId]
    );

    // 인원/총액
    const [adult, setAdult] = useState(1);
    const [child, setChild] = useState(0);
    const [infant, setInfant] = useState(0);

    const totalPrice = useMemo(() => {
        if (!selectedEvent || selectedEvent.status === "가격문의") return null;
        // 데모: 성인만 과금, 아동/유아 0원
        return adult * selectedEvent.priceAdult;
    }, [selectedEvent, adult]);

    // 탭/섹션
    const tabKeys: TabKey[] = ["select", "itinerary", "summary", "info", "schedule", "policy"];
    const { active, refs } = useActiveSection(tabKeys);

    // 스크롤 시 헤더 밑 탭바 shadow 느낌
    const [tabShadow, setTabShadow] = useState(false);
    useEffect(() => {
        const onScroll = () => setTabShadow(window.scrollY > 16);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // 캘린더 기준 월(데모: 현재 날짜 기반)
    const [calBase, setCalBase] = useState(() => startOfMonth(new Date()));
    const m1 = useMemo(() => getMonthMatrix(calBase), [calBase]);
    const m2 = useMemo(() => getMonthMatrix(addMonths(calBase, 1)), [calBase]);

    const selectedDateEvents = useMemo(() => eventByDate.get(selectedDateISO) ?? [], [eventByDate, selectedDateISO]);

    useEffect(() => {
        // 날짜가 바뀌면 그 날짜의 첫 이벤트로 자동 선택
        const first = selectedDateEvents[0];
        if (first) setSelectedEventId(first.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDateISO]);

    const scrollToTab = (key: TabKey) => {
        const el = refs.current[key];
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 120; // sticky 헤더 높이 여유
        window.scrollTo({ top, behavior: "smooth" });
    };

    return (
        <main className="bg-white">
            <Container>
                {/* 상단: 뒤로/상품ID */}
                <div className="pt-6">
                    <div className="flex items-center justify-between gap-3">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
                        >
                            ← 홈으로
                        </Link>
                        <div className="text-sm text-neutral-500">상품 ID: {id}</div>
                    </div>
                </div>

                {/* HERO: 태그 + 타이틀 + 가격 + 이미지 */}
                <section className="mt-6">
                    <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-12 lg:col-span-7">
                            <div className="flex flex-wrap gap-2">
                                {tags.map((t) => (
                                    <Badge key={t}>{t}</Badge>
                                ))}
                            </div>

                            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl">
                                {baseTitle}
                            </h1>

                            <div className="mt-4 flex flex-wrap items-end gap-3">
                                <div className="text-sm text-neutral-500">성인 1인 기준</div>
                                <div className="text-2xl font-extrabold text-neutral-900">{heroPriceText}</div>
                            </div>

                            <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                                <div className="aspect-[16/10] w-full overflow-hidden">
                                    <img src={heroImg} alt={baseTitle} className="h-full w-full object-cover object-center" />
                                </div>
                            </div>
                        </div>

                        {/* 오른쪽: “선택중인 행사” 요약 카드(데스크탑 sticky) */}
                        <aside className="col-span-12 lg:col-span-5">
                            <div className="lg:sticky lg:top-28">
                                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                                    <div className="text-base font-extrabold text-neutral-900">선택중인 행사</div>
                                    <div className="mt-3 h-px w-full bg-neutral-200" />

                                    <div className="mt-4 space-y-3">
                                        <div className="text-sm font-semibold text-neutral-900 line-clamp-2">
                                            {baseTitle}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-neutral-500">행사금액</div>
                                            <div className="text-lg font-extrabold text-neutral-900">
                                                {selectedEvent?.status === "가격문의"
                                                    ? "가격문의"
                                                    : selectedEvent
                                                        ? `${krw(selectedEvent.priceAdult)}원`
                                                        : "—"}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-neutral-500">상태</div>
                                            <div>{selectedEvent ? <StatusPill status={selectedEvent.status} /> : null}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <button
                                                type="button"
                                                className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-neutral-50"
                                            >
                                                찜하기 ♡
                                            </button>
                                            <button
                                                type="button"
                                                className="rounded-xl bg-neutral-800 px-4 py-3 text-sm font-extrabold text-white hover:bg-neutral-700"
                                                onClick={() => scrollToTab("select")}
                                            >
                                                다른 출발일 보기
                                            </button>
                                        </div>

                                        <div className="pt-2 text-xs text-neutral-500">
                                            상품코드 : HSG0002 <span className="mx-2 text-neutral-300">|</span> 행사코드 : {id ?? "—"}
                                        </div>
                                    </div>
                                </div>

                                {/* 모바일에서는 CTA를 아래쪽에 한 번 더(원하면 유지) */}
                                <div className="mt-4 grid grid-cols-2 gap-3 lg:hidden">
                                    <button
                                        type="button"
                                        className="rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-extrabold text-neutral-900 hover:bg-yellow-300"
                                    >
                                        상담하기
                                    </button>
                                    <button
                                        type="button"
                                        className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-neutral-50"
                                    >
                                        공유하기
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </section>

                {/* 탭 바 (sticky) */}
                <div
                    className={`sticky top-[72px] z-30 mt-8 bg-white/95 backdrop-blur ${tabShadow ? "shadow-sm" : ""
                    }`}
                >
                    <div className="border-y border-neutral-200">
                        <div className="flex items-center gap-2 overflow-x-auto py-3">
                            {(
                                [
                                    ["select", "상품선택"],
                                    ["itinerary", "주요 여행일정"],
                                    ["summary", "요약정보"],
                                    ["info", "상품정보"],
                                    ["schedule", "여행일정"],
                                    ["policy", "약관/환불규정"],
                                ] as Array<[TabKey, string]>
                            ).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => scrollToTab(key)}
                                    className={[
                                        "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition",
                                        active === key
                                            ? "bg-[#1C8B7B] text-white"
                                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                                    ].join(" ")}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 본문(좌: 섹션들 / 우: sticky 요약은 위에 이미 있음) */}
                <div className="pb-16 pt-8">
                    <div className="grid grid-cols-12 gap-8">
                        {/* LEFT CONTENT */}
                        <div className="col-span-12 lg:col-span-7 space-y-10">
                            {/* 상품선택 */}
                            <section
                                id="select"
                                ref={(el) => {
                                    refs.current.select = el;
                                }}
                                className="scroll-mt-36"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-extrabold text-neutral-900">상품선택</h2>
                                    <div className="text-xs text-neutral-500">출발일 선택 → 행사 선택 → 인원 선택</div>
                                </div>

                                <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-sm font-extrabold text-neutral-900">출발일 선택</div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                className="grid h-9 w-9 place-items-center rounded-full border border-neutral-200 bg-white hover:bg-neutral-50"
                                                onClick={() => setCalBase((d) => addMonths(d, -1))}
                                                aria-label="prev month"
                                            >
                                                ‹
                                            </button>
                                            <button
                                                type="button"
                                                className="grid h-9 w-9 place-items-center rounded-full border border-neutral-200 bg-white hover:bg-neutral-50"
                                                onClick={() => setCalBase((d) => addMonths(d, 1))}
                                                aria-label="next month"
                                            >
                                                ›
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2개월 캘린더 (데스크탑 2컬럼 / 모바일 1컬럼) */}
                                    <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {[m1, m2].map((m, idx) => (
                                            <div key={idx} className="rounded-2xl border border-neutral-200 p-4">
                                                <div className="text-center text-sm font-extrabold text-neutral-900">
                                                    {m.start.getFullYear()}년 {String(m.start.getMonth() + 1).padStart(2, "0")}월
                                                </div>

                                                <div className="mt-3 grid grid-cols-7 text-center text-xs font-semibold text-neutral-500">
                                                    {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                                                        <div key={d} className="py-2">
                                                            {d}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-7 gap-1">
                                                    {m.cells.map((cell, i) => {
                                                        if (!cell.date) return <div key={i} className="h-12" />;

                                                        const iso = toISODate(cell.date);
                                                        const list = eventByDate.get(iso) ?? [];
                                                        const cheapest =
                                                            list.length === 0
                                                                ? null
                                                                : list.some((x) => x.status === "가격문의")
                                                                    ? "가격문의"
                                                                    : Math.min(...list.map((x) => x.priceAdult));

                                                        const selected = iso === selectedDateISO;

                                                        return (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                onClick={() => setSelectedDateISO(iso)}
                                                                className={[
                                                                    "h-12 rounded-xl border text-left px-2 py-1 transition",
                                                                    selected
                                                                        ? "border-[#1C8B7B] bg-[#1C8B7B]/10"
                                                                        : "border-transparent hover:border-neutral-200 hover:bg-neutral-50",
                                                                ].join(" ")}
                                                            >
                                                                <div className="text-xs font-bold text-neutral-800">{cell.date.getDate()}</div>
                                                                <div className="mt-0.5 text-[10px] font-bold text-neutral-500 whitespace-nowrap overflow-hidden text-ellipsis leading-none tracking-tight">
                                                                    {cheapest === null
                                                                        ? ""
                                                                        : cheapest === "가격문의"
                                                                            ? "가격문의"
                                                                            : `${Math.round(cheapest / 10000)}만`}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 행사 선택 */}
                                    <div className="mt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-extrabold text-neutral-900">행사 선택</div>
                                            <div className="text-xs text-neutral-500">선택한 날짜: {selectedDateISO}</div>
                                        </div>

                                        <div className="mt-3 space-y-3">
                                            {selectedDateEvents.length === 0 ? (
                                                <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
                                                    선택한 날짜에 등록된 행사가 없어요.
                                                </div>
                                            ) : (
                                                selectedDateEvents.map((ev) => {
                                                    const isSelected = ev.id === selectedEventId;
                                                    const priceText = ev.status === "가격문의" ? "가격문의" : `${krw(ev.priceAdult)}원`;
                                                    return (
                                                        <button
                                                            key={ev.id}
                                                            type="button"
                                                            onClick={() => setSelectedEventId(ev.id)}
                                                            className={[
                                                                "w-full rounded-2xl border p-4 text-left transition",
                                                                isSelected
                                                                    ? "border-[#1C8B7B] bg-[#1C8B7B]/5"
                                                                    : "border-neutral-200 bg-white hover:bg-neutral-50",
                                                            ].join(" ")}
                                                        >
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <StatusPill status={ev.status} />
                                                                        <div className="text-sm font-extrabold text-neutral-900 line-clamp-1">
                                                                            {baseTitle}
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                                                                        <span>잔여인원: (데모)</span>
                                                                        <span>최대예약: 20명 (데모)</span>
                                                                        <span>최소출발: 4명 (데모)</span>
                                                                    </div>
                                                                </div>

                                                                <div className="shrink-0 text-right">
                                                                    <div className="text-xs text-neutral-500">상품금액</div>
                                                                    <div className="mt-1 text-base font-extrabold text-neutral-900">{priceText}</div>
                                                                    <div className="mt-3 inline-flex rounded-xl bg-[#1C8B7B] px-4 py-2 text-xs font-extrabold text-white">
                                                                        선택됨
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {/* 인원 선택 + 총액 */}
                                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <QtyControl label="성인 (만 12세 이상)" value={adult} onChange={setAdult} />
                                        <QtyControl
                                            label="아동 (만 12세 미만)"
                                            value={child}
                                            onChange={setChild}
                                            hint="(데모) 아동 요금 0원"
                                        />
                                        <QtyControl
                                            label="유아 (만 2세 미만)"
                                            value={infant}
                                            onChange={setInfant}
                                            hint="(데모) 유아 요금 0원"
                                        />
                                    </div>

                                    <div className="mt-4 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 md:flex-row md:items-center">
                                        <div className="text-sm font-semibold text-neutral-600">
                                            총 금액{" "}
                                            <span className="ml-2 text-2xl font-extrabold text-neutral-900">
                                                {totalPrice === null ? "가격문의" : `${krw(totalPrice)}원`}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="rounded-2xl bg-[#1C8B7B] px-6 py-3 text-sm font-extrabold text-white hover:brightness-95"
                                        >
                                            예약하기
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* 주요 여행일정 */}
                            <section
                                id="itinerary"
                                ref={(el) => {
                                    refs.current.itinerary = el;
                                }}
                                className="scroll-mt-36"
                            >
                                <h2 className="text-lg font-extrabold text-neutral-900">주요 여행일정</h2>

                                <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-2xl border border-neutral-200 p-4">
                                            <div className="text-sm font-extrabold text-neutral-900">여행기간</div>
                                            <div className="mt-2 text-sm text-neutral-600">
                                                2026년 01월 28일 (수) ~ 2026년 01월 30일 (금)
                                            </div>
                                            <div className="mt-2 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                                                2박 3일
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-neutral-200 p-4">
                                            <div className="text-sm font-extrabold text-neutral-900">방문도시</div>
                                            <div className="mt-2 text-sm text-neutral-600">사가</div>
                                            <div className="mt-4 text-xs text-neutral-500">
                                                (데모) 실제로는 API로 도시/코스/호텔 데이터를 가져오면 돼.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 지도 제거 후 대체 안내(원하면 삭제 가능) */}
                                <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
                                    <div className="text-sm font-extrabold text-neutral-900">집결/이동 안내</div>
                                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                                        (데모) 미팅 장소/픽업/이동 동선 정보는 추후 확정서 또는 상세정보로 제공됩니다.
                                    </p>
                                </div>
                            </section>

                            {/* 요약정보 */}
                            <section
                                id="summary"
                                ref={(el) => {
                                    refs.current.summary = el;
                                }}
                                className="scroll-mt-36"
                            >
                                <h2 className="text-lg font-extrabold text-neutral-900">요약정보</h2>

                                <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                                        <div className="flex items-center gap-2">
                                            <div className="grid h-8 w-8 place-items-center rounded-full bg-sky-50 text-sky-700">✓</div>
                                            <div className="text-sm font-extrabold text-neutral-900">포함사항</div>
                                        </div>
                                        <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                                            <li>• 호텔: 센트럴 호텔 이마리(1인 1실/조식 포함)</li>
                                            <li>• 골프 36홀: 그린피, 카트피 포함(4인 1조 기준)</li>
                                            <li>• 송영차량: 공항-호텔/송영</li>
                                            <li>• 여행자보험: 1억원 해외 여행자 보험</li>
                                        </ul>
                                    </div>

                                    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                                        <div className="flex items-center gap-2">
                                            <div className="grid h-8 w-8 place-items-center rounded-full bg-rose-50 text-rose-700">✕</div>
                                            <div className="text-sm font-extrabold text-neutral-900">불포함사항</div>
                                        </div>
                                        <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                                            <li>• 왕복항공권</li>
                                            <li>• 캐디피, 클럽렌탈비</li>
                                            <li>• 일정표 외 식사</li>
                                            <li>• 개인 경비</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
                                    <div className="text-sm font-extrabold text-neutral-900">참고사항</div>
                                    <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                                        <li>• 예약 시점과 현지 상황에 따라 금액이 변동될 수 있습니다.</li>
                                        <li>• 확정서에 기재된 시간에 맞춰 출발, 미팅 장소 사전 대기 부탁드립니다.</li>
                                        <li>• 라운드/차량 운영상 당일 변경이 어려울 수 있습니다.</li>
                                        <li>• 분실물은 회수가 어려우며, 국제 배송 비용은 고객 부담입니다.</li>
                                    </ul>
                                </div>
                            </section>

                            {/* 상품정보 */}
                            <section
                                id="info"
                                ref={(el) => {
                                    refs.current.info = el;
                                }}
                                className="scroll-mt-36"
                            >
                                <h2 className="text-lg font-extrabold text-neutral-900">상품정보</h2>

                                <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
                                    <div className="text-sm font-extrabold text-neutral-900">상품 소개</div>
                                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                                        남자끼리 골프 여행 추천, 온천 + 1인실 + 자유 저녁 시간 등의 포인트를 강조하는 영역이야.
                                        (데모) 실제 내용은 CMS/백오피스에서 내려주는 HTML 또는 마크다운으로 교체하면 됨.
                                    </p>

                                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                                        {["호텔", "골프코스", "식사/자유시간"].map((x) => (
                                            <div key={x} className="rounded-2xl border border-neutral-200 p-4">
                                                <div className="text-sm font-extrabold text-neutral-900">{x}</div>
                                                <div className="mt-2 text-sm text-neutral-600">
                                                    (데모) {x} 관련 상세 설명이 들어갑니다.
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* 여행일정 */}
                            <section
                                id="schedule"
                                ref={(el) => {
                                    refs.current.schedule = el;
                                }}
                                className="scroll-mt-36"
                            >
                                <h2 className="text-lg font-extrabold text-neutral-900">여행일정</h2>

                                <div className="mt-4 space-y-4">
                                    {[
                                        { day: "1일차", date: "2026/01/28(수)", hotel: "센트럴 호텔 이마리", meals: ["아침: 불포함", "점심: 불포함", "저녁: 불포함"] },
                                        { day: "2일차", date: "2026/01/29(목)", hotel: "센트럴 호텔 이마리", meals: ["아침: 호텔식", "점심: 불포함", "저녁: 불포함"] },
                                        { day: "3일차", date: "2026/01/30(금)", hotel: "호텔 없음", meals: ["아침: 호텔식", "점심: 불포함", "저녁: 불포함"] },
                                    ].map((d) => (
                                        <div key={d.day} className="rounded-2xl border border-neutral-200 bg-white p-5">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="text-sm font-extrabold text-neutral-900">
                                                    {d.day} <span className="ml-2 text-xs text-neutral-500">{d.date}</span>
                                                </div>
                                                <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                                                    {d.hotel}
                                                </div>
                                            </div>
                                            <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                                                {d.meals.map((m) => (
                                                    <li key={m}>• {m}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 약관/환불규정 */}
                            <section
                                id="policy"
                                ref={(el) => {
                                    refs.current.policy = el;
                                }}
                                className="scroll-mt-36"
                            >
                                <h2 className="text-lg font-extrabold text-neutral-900">약관/환불규정</h2>
                                <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
                                    <div className="text-sm font-extrabold text-neutral-900">안내</div>
                                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                                        (데모) 본 상품은 해외여행 특별약관이 적용됩니다. 상세 약관/환불규정은 추후 실제 데이터 연동 시 노출하세요.
                                    </p>
                                    <button
                                        type="button"
                                        className="mt-5 inline-flex items-center justify-center rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-neutral-50"
                                    >
                                        약관 상세보기
                                    </button>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT: 데스크탑에서 “선택중인 행사” 카드가 위에 있으니 여기서는 비워도 되지만,
                필요하면 추가 sticky 블록을 둘 수 있음 */}
                        <div className="col-span-12 lg:col-span-5" />
                    </div>
                </div>
            </Container>
        </main>
    );
}
