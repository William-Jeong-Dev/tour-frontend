import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Container from "../../components/common/Container";

import type { DepartStatus, Departure, MealType, OfferType, Product } from "../../types/product";
import { getProduct } from "../../api/products.api";
import { getThemeById } from "../../api/themes.api";

type Card = {
    id: string;
    title: string;
    price: string;
    img: string;
    badge?: string;
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

function formatManwon(n: number) {
    // 97.9만 / 98만 같이 1줄로 보이도록
    const v = n / 10000;
    const fixed = Math.round(v * 10) / 10;
    const s = fixed.toFixed(1);
    return `${s.endsWith(".0") ? s.slice(0, -2) : s}만`;
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

function TagChip({ label, to }: { label: string; to?: string }) {
    const base =
        "inline-flex items-center rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-bold text-neutral-700";

    if (to) {
        return (
            <Link to={to} className={`${base} hover:bg-neutral-50`}>
                {label}
            </Link>
        );
    }
    return <span className={base}>{label}</span>;
}

function statusLabel(status: DepartStatus) {
    if (status === "AVAILABLE") return "예약가능";
    if (status === "CONFIRMED") return "출발확정";
    return "가격문의";
}

function StatusPill({ status }: { status: DepartStatus }) {
    const cls =
        status === "AVAILABLE"
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : status === "CONFIRMED"
                ? "bg-sky-50 text-sky-700 border-sky-100"
                : "bg-neutral-100 text-neutral-600 border-neutral-200";

    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${cls}`}>
            {statusLabel(status)}
        </span>
    );
}

function OfferPill({ offerType }: { offerType: OfferType }) {
    const label = offerType === "NORMAL" ? "기본" : offerType === "EVENT" ? "이벤트" : "특가";
    const cls =
        offerType === "SPECIAL"
            ? "bg-rose-50 text-rose-700 border-rose-100"
            : offerType === "EVENT"
                ? "bg-amber-50 text-amber-800 border-amber-100"
                : "bg-neutral-100 text-neutral-700 border-neutral-200";

    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${cls}`}>
            {label}
        </span>
    );
}

function mealLabel(m: MealType) {
    if (m === "HOTEL") return "호텔식";
    if (m === "INCLUDED") return "포함";
    if (m === "EXCLUDED") return "불포함";
    if (m === "FREE") return "자유";
    return "-";
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
    const nav = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const navProduct = (location.state as { product?: Card } | null)?.product;

    const productQuery = useQuery({
        queryKey: ["product", { id }],
        queryFn: () => getProduct(String(id ?? "")),
        enabled: Boolean(id),
    });

    const product = (productQuery.data ?? null) as Product | null;

    const themeQuery = useQuery({
        queryKey: ["theme", product?.themeId],
        queryFn: () => getThemeById(String(product?.themeId)),
        enabled: Boolean(product?.themeId),
    });

    useEffect(() => {
        const hash = window.location.hash.replace("#", "") as TabKey;
        if (!hash) return;

        // refs가 연결되기 전에 실행될 수 있으니 약간 딜레이
        setTimeout(() => {
            if (refs.current[hash]) scrollToTab(hash);
        }, 50);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const tags = useMemo(() => {
        const out: Array<{ label: string; to?: string }> = [];

        // 1) 지역(정보용)
        if (product?.region) out.push({ label: product.region });

        // 2) 추천(임시 고정 태그)
        out.push({ label: "추천" });

        // 3) 테마(있으면 클릭 -> /theme/:slug)
        if (themeQuery.data?.name && themeQuery.data?.slug) {
            out.push({ label: themeQuery.data.name, to: `/theme/${themeQuery.data.slug}` });
        }

        // 4) navProduct.badge가 region과 다르면 추가(중복 방지)
        if (navProduct?.badge && navProduct.badge !== product?.region) {
            out.push({ label: navProduct.badge });
        }

        // 5) label 중복 제거
        const seen = new Set<string>();
        return out.filter((x) => (seen.has(x.label) ? false : (seen.add(x.label), true)));
    }, [product?.region, navProduct?.badge, themeQuery.data?.name, themeQuery.data?.slug]);

    const baseTitle =
        product?.title ??
        "[일본골프][사가] 이마리 실속 온천 골프(3일/36홀) #1인1실 #이마리시내호텔";

    const heroPriceText = product?.priceText ?? navProduct?.price ?? "상담 문의";

    const heroImg =
        product?.thumbnailUrl ??
        navProduct?.img ??
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=80";

    const departures: Departure[] = useMemo(() => {
        const list = Array.isArray(product?.departures) ? product?.departures : [];
        return [...(list ?? [])].sort((a, b) => {
            if (a.dateISO !== b.dateISO) return a.dateISO.localeCompare(b.dateISO);
            if (a.status !== b.status) return a.status.localeCompare(b.status);
            if (a.offerType !== b.offerType) return a.offerType.localeCompare(b.offerType);
            return (a.priceAdult ?? 0) - (b.priceAdult ?? 0);
        });
    }, [product?.departures]);

    const depByDate = useMemo(() => {
        const m = new Map<string, Departure[]>();
        departures.forEach((d) => {
            const list = m.get(d.dateISO) ?? [];
            list.push(d);
            m.set(d.dateISO, list);
        });
        return m;
    }, [departures]);

    const initialDateISO = useMemo(() => {
        const first = departures[0]?.dateISO;
        return first ?? toISODate(new Date());
    }, [departures]);

    const [selectedDateISO, setSelectedDateISO] = useState<string>(initialDateISO);
    const [selectedDepartureId, setSelectedDepartureId] = useState<string>(departures[0]?.id ?? "");

    useEffect(() => {
        if (!departures.length) return;
        if (!depByDate.get(selectedDateISO)) {
            setSelectedDateISO(departures[0].dateISO);
        }
        if (!departures.some((d) => d.id === selectedDepartureId)) {
            setSelectedDepartureId(departures[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departures.length]);

    const selectedDeparture = useMemo(
        () => departures.find((d) => d.id === selectedDepartureId) ?? null,
        [departures, selectedDepartureId]
    );

    useEffect(() => {
        if (!departures.length) return;
        if (!depByDate.has(selectedDateISO)) {
            setSelectedDateISO(departures[0].dateISO);
        }
        if (!selectedDepartureId || !departures.some((d) => d.id === selectedDepartureId)) {
            setSelectedDepartureId(departures[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departures.length]);

    // 인원/총액
    const [adult, setAdult] = useState(1);
    const [child, setChild] = useState(0);
    const [infant, setInfant] = useState(0);

    const totalPrice = useMemo(() => {
        if (!selectedDeparture || selectedDeparture.status === "INQUIRY") return null;
        return adult * (selectedDeparture.priceAdult ?? 0);
    }, [selectedDeparture, adult]);

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

    const selectedDateDepartures = useMemo(
        () => depByDate.get(selectedDateISO) ?? [],
        [depByDate, selectedDateISO]
    );

    useEffect(() => {
        const list = selectedDateDepartures;
        if (!list.length) return;
        const priced = list.filter((x) => x.status !== "INQUIRY" && (x.priceAdult ?? 0) > 0);
        const next = priced.length
            ? [...priced].sort((a, b) => (a.priceAdult ?? 0) - (b.priceAdult ?? 0))[0]
            : list[0];
        if (next) setSelectedDepartureId(next.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDateISO]);

    const scrollToTab = (key: TabKey) => {
        const el = refs.current[key];
        if (!el) return;

        // ✅ URL에 해시 반영 (뒤로가기/새로고침 시도 대비)
        window.history.replaceState(null, "", `#${key}`);

        const top = el.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top, behavior: "smooth" });
    };

    return (
        <main className="bg-white">
            <Container>
                {/* ✅ 상단: 뒤로/상품ID (모바일 줄바꿈/노출 문제 해결) */}
                <div className="pt-6">
                    <div className="flex items-center justify-between gap-3">
                        {/* 모바일에서 글자 줄바꿈 방지 + 좁으면 오른쪽 요소가 숨겨지도록 */}
                        <button
                            type="button"
                            onClick={() => nav(-1)}
                            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
                        >
                            ← 홈으로
                        </button>
                    </div>
                </div>

                {/* HERO */}
                <section className="mt-6">
                    <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-12 lg:col-span-7">
                            <div className="flex flex-wrap gap-2">
                                {tags.map((t) => (
                                    <TagChip key={`${t.label}-${t.to ?? ""}`} label={t.label} to={t.to} />
                                ))}
                            </div>

                                <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl">
                                {baseTitle}
                                </h1>

                            <div className="mt-4 flex flex-wrap items-end gap-3">
                                <div className="text-sm text-neutral-500">성인 1인 기준</div>
                                <div className="text-2xl font-extrabold text-neutral-900">{heroPriceText}</div>

                            <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                                <div className="aspect-[16/10] w-full overflow-hidden">
                                    <img
                                        src={heroImg}
                                        alt={baseTitle}
                                        className="h-full w-full object-cover object-center"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 오른쪽: “선택중인 행사” */}
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
                                                {selectedDeparture?.status === "INQUIRY"
                                                    ? "가격문의"
                                                    : selectedDeparture
                                                        ? `${krw(selectedDeparture.priceAdult ?? 0)}원`
                                                        : "—"}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-neutral-500">상태</div>
                                            <div>
                                                {selectedDeparture ? <StatusPill status={selectedDeparture.status} /> : null}
                                            </div>
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
                                        "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition",
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

                {/* 본문 */}
                <div className="pb-16 pt-8">
                    <div className="grid grid-cols-12 gap-8">
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
                                                        const list = depByDate.get(iso) ?? [];
                                                        const cheapest =
                                                            list.length === 0
                                                                ? null
                                                                : list.some((x) => x.status === "INQUIRY")
                                                                    ? "가격문의"
                                                                    : Math.min(...list.map((x) => x.priceAdult ?? 0));

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
                                                                            : formatManwon(cheapest)}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-extrabold text-neutral-900">행사 선택</div>
                                            <div className="text-xs text-neutral-500">선택한 날짜: {selectedDateISO}</div>
                                        </div>

                                        <div className="mt-3 space-y-3">
                                            {selectedDateDepartures.length === 0 ? (
                                                <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
                                                    선택한 날짜에 등록된 행사가 없어요.
                                                </div>
                                            ) : (
                                                selectedDateDepartures.map((ev) => {
                                                    const isSelected = ev.id === selectedDepartureId;
                                                    const priceText = ev.status === "INQUIRY" ? "가격문의" : `${krw(ev.priceAdult)}원`;
                                                    return (
                                                        <button
                                                            key={ev.id}
                                                            type="button"
                                                            onClick={() => setSelectedDepartureId(ev.id)}
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
                                                                        <OfferPill offerType={ev.offerType} />
                                                                        <div className="text-sm font-extrabold text-neutral-900 line-clamp-1">
                                                                            {baseTitle}
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                                                                        <span>잔여: {ev.remain == null ? "-" : `${ev.remain}명`}</span>
                                                                        <span>최대: {ev.max == null ? "-" : `${ev.max}명`}</span>
                                                                        <span>최소: {ev.min == null ? "-" : `${ev.min}명`}</span>
                                                                        {ev.note ? <span className="text-neutral-400">메모: {ev.note}</span> : null}
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
                                            {(product?.included ?? []).length ? (
                                                (product?.included ?? []).map((x, i) => <li key={`${x}-${i}`}>• {x}</li>)
                                            ) : (
                                                <li className="text-neutral-400">등록된 포함사항이 없습니다.</li>
                                            )}
                                        </ul>
                                    </div>

                                    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                                        <div className="flex items-center gap-2">
                                            <div className="grid h-8 w-8 place-items-center rounded-full bg-rose-50 text-rose-700">✕</div>
                                            <div className="text-sm font-extrabold text-neutral-900">불포함사항</div>
                                        </div>
                                        <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                                            {(product?.excluded ?? []).length ? (
                                                (product?.excluded ?? []).map((x, i) => <li key={`${x}-${i}`}>• {x}</li>)
                                            ) : (
                                                <li className="text-neutral-400">등록된 불포함사항이 없습니다.</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
                                    <div className="text-sm font-extrabold text-neutral-900">참고사항</div>
                                    <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                                        {(product?.notices ?? []).length ? (
                                            (product?.notices ?? []).map((x, i) => <li key={`${x}-${i}`}>• {x}</li>)
                                        ) : (
                                            <li className="text-neutral-400">등록된 참고사항이 없습니다.</li>
                                        )}
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
                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                                        {product?.description || "(임시) 아직 상품 소개가 없습니다."}
                                    </p>
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
                                    {(product?.itinerary ?? []).length ? (
                                        (product?.itinerary ?? []).map((day) => (
                                            <div key={day.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div className="text-sm font-extrabold text-neutral-900">
                                                        {day.title || `${day.dayNo}일차`}
                                                        {day.dateText ? (
                                                            <span className="ml-2 text-xs text-neutral-500">{day.dateText}</span>
                                                        ) : null}
                                                    </div>
                                                    <div className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                                                        {product?.region ?? ""}
                                                    </div>
                                                </div>

                                                <div className="mt-4 overflow-x-auto rounded-2xl border border-neutral-200">
                                                    <table className="min-w-[860px] w-full text-left text-xs">
                                                        <thead className="bg-neutral-50 text-neutral-600">
                                                        <tr>
                                                            <th className="px-3 py-2 w-[140px]">장소</th>
                                                            <th className="px-3 py-2 w-[110px]">교통</th>
                                                            <th className="px-3 py-2 w-[90px]">시간</th>
                                                            <th className="px-3 py-2">내용</th>
                                                            <th className="px-3 py-2 w-[80px]">조식</th>
                                                            <th className="px-3 py-2 w-[80px]">중식</th>
                                                            <th className="px-3 py-2 w-[80px]">석식</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-neutral-200">
                                                        {(day.rows ?? []).map((row) => (
                                                            <tr key={row.id} className="align-top text-neutral-800">
                                                                <td className="px-3 py-2">{row.place || "-"}</td>
                                                                <td className="px-3 py-2">{row.transport || "-"}</td>
                                                                <td className="px-3 py-2">{row.time || "-"}</td>
                                                                <td className="px-3 py-2 whitespace-pre-wrap">{row.content || "-"}</td>
                                                                <td className="px-3 py-2">{mealLabel(row.mealMorning)}</td>
                                                                <td className="px-3 py-2">{mealLabel(row.mealLunch)}</td>
                                                                <td className="px-3 py-2">{mealLabel(row.mealDinner)}</td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
                                            등록된 일정표가 없습니다.
                                        </div>
                                    )}
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

                        <div className="col-span-12 lg:col-span-5" />
                    </div>
                </div>
            </Container>
        </main>
    );
}
