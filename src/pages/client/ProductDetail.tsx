import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import Container from "../../components/common/Container";

import type { DepartStatus, Departure, MealType, OfferType, Product } from "../../types/product";
import { getProduct } from "../../api/products.api";
import { getThemeById } from "../../api/themes.api";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useSession } from "../../hooks/useSession";
import { addFavorite, removeFavorite, isFavorited } from "../../api/favorites.api";
import { createBooking } from "../../api/bookings.api";

type Card = {
    id: string;
    title: string;
    price: string;
    img: string;
    badge?: string;
};

type TabKey = "select" | "itinerary" | "summary" | "info" | "schedule" | "insurance" | "policy";

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
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
                if (visible[0]?.target?.id) setActive(visible[0].target.id as TabKey);
            },
            {
                root: null,
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

    return { active, setActive, refs };
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

export function useCreateBooking(userId: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: any) => createBooking(userId, payload),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["bookings", "me"] });
        },
    });
}

export default function ProductDetail() {
    const nav = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const { session, loading } = useSession();
    const qc = useQueryClient();
    const userId = session?.user?.id ?? null;

    const navProduct = (location.state as { product?: Card } | null)?.product;

    const favQuery = useQuery({
        queryKey: ["favorite", { productId: id, userId }],
        queryFn: () => isFavorited(String(id), String(userId)),
        enabled: Boolean(id && userId), // ✅ id/userId 없으면 실행 안 함
    });

    const isFav = favQuery.data ?? false;

    const toggleFav = useMutation({
        mutationFn: async () => {
            if (!userId) throw new Error("NOT_LOGGED_IN");
            if (isFav) return removeFavorite(String(id), userId);
            return addFavorite(String(id), userId);
        },
        onSuccess: async () => {
            await qc.invalidateQueries({
                queryKey: ["favorite", { productId: id, userId }],
            });
        },
    });

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

    // ✅ 여행자 보험: 노출 여부(활성 + 내용 존재)
    const insuranceEnabled = useMemo(() => {
        const enabled = Boolean((product as any)?.travelInsuranceEnabled);
        const content = String((product as any)?.travelInsuranceContent ?? "").trim();
        return enabled && content.length > 0;
    }, [product]);

    // 탭/섹션
    const tabKeys: TabKey[] = useMemo(() => {
        const base: TabKey[] = ["select", "itinerary", "summary", "info", "schedule"];
        if (insuranceEnabled) base.push("insurance");
        base.push("policy");
        return base;
    }, [insuranceEnabled]);

    const { active, setActive, refs } = useActiveSection(tabKeys);

    // ✅ 클릭 시 이동 함수 (refs 말고 id로 찾으면 안정적)
    const scrollToTab = (key: TabKey) => {
        // 1) 섹션을 id로 찾는다
        const el = document.getElementById(key);
        if (!el) {
            console.warn("[scrollToTab] section not found:", key);
            return;
        }

        // 2) 해시 갱신
        window.history.replaceState(null, "", `#${key}`);

        // 3) 가장 안정적인 스크롤: scrollIntoView + offset 보정
        //    (scrollIntoView는 확실히 움직임)
        el.scrollIntoView({ behavior: "smooth", block: "start" });

        // sticky 헤더 보정: scrollIntoView 후에 살짝 위로 당김
        const offset = 120;
        setTimeout(() => {
            window.scrollBy({ top: -offset, left: 0, behavior: "instant" as ScrollBehavior });
        }, 250);
    };

    // ✅ 상세로 들어오면 “항상 맨 위”로
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }, [id]);

    // ✅ 해시가 있으면 해당 섹션으로 이동
    useEffect(() => {
        const hash = window.location.hash.replace("#", "") as TabKey;
        if (!hash) return;

        setTimeout(() => {
            setActive(hash);
            scrollToTab(hash);
        }, 50);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const tags = useMemo(() => {
        const out: Array<{ label: string; to?: string }> = [];

        if (product?.region) out.push({ label: product.region });
        out.push({ label: "추천" });

        if (themeQuery.data?.name && themeQuery.data?.slug) {
            out.push({ label: themeQuery.data.name, to: `/theme/${themeQuery.data.slug}` });
        }

        if (navProduct?.badge && navProduct.badge !== product?.region) {
            out.push({ label: navProduct.badge });
        }

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

    const bookingMut = useCreateBooking(String(userId));

    const totalPrice = useMemo(() => {
        if (!selectedDeparture || selectedDeparture.status === "INQUIRY") return null;
        return adult * (selectedDeparture.priceAdult ?? 0);
    }, [selectedDeparture, adult]);

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

    const selectedDateDepartures = useMemo(() => depByDate.get(selectedDateISO) ?? [], [depByDate, selectedDateISO]);

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

    return (
        <main className="bg-white">
            <Container>
                {/* ✅ 상단: 뒤로 */}
                <div className="pt-6">
                    <div className="flex items-center justify-between gap-3">
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

                            {/* ✅ 여기 닫는 div 누락되면 전체가 망가짐 */}
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

                        {/* 오른쪽: “선택중인 행사” */}
                        <aside className="col-span-12 lg:col-span-5">
                            <div className="lg:sticky lg:top-28">
                                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                                    <div className="text-base font-extrabold text-neutral-900">선택중인 행사</div>
                                    <div className="mt-3 h-px w-full bg-neutral-200" />

                                    <div className="mt-4 space-y-3">
                                        <div className="text-sm font-semibold text-neutral-900 line-clamp-2">{baseTitle}</div>

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
                                            <div>{selectedDeparture ? <StatusPill status={selectedDeparture.status} /> : null}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <button
                                                type="button"
                                                className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-bold text-neutral-800 hover:bg-neutral-50"
                                                onClick={() => {
                                                    if (!userId) {
                                                        nav("/login", { state: { redirectTo: location.pathname } });
                                                        return;
                                                    }
                                                    toggleFav.mutate();
                                                }}
                                            >
                                                {session ? (isFav ? "찜취소 ♥" : "찜하기 ♡") : "찜하기 ♡"}
                                            </button>
                                            <button
                                                type="button"
                                                className="rounded-xl bg-neutral-800 px-4 py-3 text-sm font-extrabold text-white hover:bg-neutral-700"
                                                onClick={() => {
                                                    setActive("select");
                                                    scrollToTab("select");
                                                }}
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
                                        1:1 맞춤견적
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
                <div className={`sticky top-[72px] z-30 mt-8 bg-white/95 backdrop-blur ${tabShadow ? "shadow-sm" : ""}`}>
                    <div className="border-y border-neutral-200">
                        <div className="flex items-center gap-2 overflow-x-auto py-3">
                            {(
                                [
                                    ["select", "상품선택"],
                                    ["itinerary", "주요 여행일정"],
                                    ["summary", "요약정보"],
                                    ["schedule", "여행일정"],
                                    ["info", "상품정보"],
                                    ...(insuranceEnabled ? ([["insurance", "여행자 보험"]] as Array<[TabKey, string]>) : []),
                                    ["policy", "약관/환불규정"],
                                ] as Array<[TabKey, string]>
                            ).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                        setActive(key);
                                        scrollToTab(key);
                                    }}
                                    className={[
                                        "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition",
                                        active === key ? "bg-[#2E97F2] text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
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
                                                                        ? "border-[#2E97F2] bg-[#2E97F2]/10"
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
                                                                    ? "border-[#2E97F2] bg-[#2E97F2]/5"
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
                                                                    <div className="mt-3 inline-flex rounded-xl bg-[#2E97F2] px-4 py-2 text-xs font-extrabold text-white">
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
                                            className="rounded-2xl bg-[#2E97F2] px-6 py-3 text-sm font-extrabold text-white hover:brightness-95 disabled:opacity-60"
                                            disabled={bookingMut.isPending}
                                            onClick={() => {
                                                if (!userId) {
                                                    nav("/login", { state: { redirectTo: location.pathname } });
                                                    return;
                                                }

                                                const peopleCount = adult + child + infant;

                                                if (peopleCount <= 0) {
                                                    alert("인원을 선택해 주세요.");
                                                    return;
                                                }

                                                if (!selectedDateISO) {
                                                    alert("출발일을 선택해 주세요.");
                                                    return;
                                                }

                                                bookingMut.mutate(
                                                    {
                                                        product_id: String(id),
                                                        travel_date: selectedDateISO,
                                                        people_count: Math.max(1, peopleCount),
                                                        memo_user: `선택 행사ID: ${selectedDepartureId || "-"} / 성인:${adult}, 아동:${child}, 유아:${infant}`,
                                                    },
                                                    {
                                                        onSuccess: () => {
                                                            alert("예약 접수가 완료되었습니다.");
                                                            // nav("/mypage"); // 원하면 이동
                                                        },
                                                        onError: (e: any) => {
                                                            alert(e?.message ?? "예약 접수에 실패했습니다.");
                                                        },
                                                    }
                                                );
                                            }}
                                        >
                                            {bookingMut.isPending ? "접수 중..." : "예약하기"}
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
                                                기본 일정은 {product?.nights ?? 0}박 {product?.days ?? 0}일이며, 일정 조정은 상담을 통해 안내드립니다.
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

                            {/* 여행일정 */}
                            <section
                                id="schedule"
                                ref={(el) => {
                                    refs.current.schedule = el;
                                }}
                                className="scroll-mt-36"
                            >
                                <h2 className="text-lg font-extrabold text-neutral-900">여행일정</h2>

                                <div className="mt-4">
                                    {(product?.itinerary ?? []).length ? (
                                        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                                            <div className="overflow-x-auto rounded-2xl border border-neutral-200">
                                                <table className="min-w-[700px] w-full text-left text-sm">
                                                    <thead className="bg-neutral-50 text-neutral-600">
                                                    <tr className="divide-x divide-neutral-200">
                                                        <th className="px-3 py-2 w-[80px]">일차</th>
                                                        <th className="px-3 py-2 w-[110px]">교통편</th>
                                                        <th className="hidden px-3 py-2 w-[90px] md:table-cell">시간</th>
                                                        <th className="px-3 py-2">일정</th>
                                                        <th className="px-3 py-2 w-[160px]">식사</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-neutral-200">
                                                    {(product?.itinerary ?? []).flatMap((day) =>
                                                        (day.rows ?? []).map((row, rowIdx) => {
                                                            const getMealText = (meal: MealType | undefined | null) => {
                                                                if (!meal || meal === "NONE") return "불포함";
                                                                return mealLabel(meal);
                                                            };
                                                            const isFirstRowOfDay = rowIdx === 0;

                                                            return (
                                                                <tr key={row.id} className="align-top text-neutral-800 divide-x divide-neutral-200">
                                                                    <td className="px-3 py-2 font-semibold">{isFirstRowOfDay ? `${day.dayNo}일차` : ""}</td>
                                                                    <td className="px-3 py-2">{row.transport || "-"}</td>
                                                                    <td className="hidden px-3 py-2 md:table-cell">{row.time || "-"}</td>
                                                                    <td className="px-3 py-2 whitespace-pre-wrap">{row.content || row.place || "-"}</td>
                                                                    <td className="px-3 py-2">
                                                                        <div className="space-y-1 text-xs">
                                                                            <div>조식 : {getMealText(row.mealMorning)}</div>
                                                                            <div>중식 : {getMealText(row.mealLunch)}</div>
                                                                            <div>석식 : {getMealText(row.mealDinner)}</div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
                                            등록된 일정표가 없습니다.
                                        </div>
                                    )}
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

                                {/* ✅ 상세 블록 렌더 (detailBlocks) - 사진 먼저 */}
                                {Array.isArray((product as any)?.detailBlocks) && (product as any).detailBlocks.length > 0 ? (
                                    <div className="mt-4 space-y-4">
                                        {(product as any).detailBlocks.map((b: any) => {
                                            if (!b) return null;

                                            if (b.type === "TITLE") {
                                                return (
                                                    <div key={b.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
                                                        <div className="text-base font-extrabold text-neutral-900">{String(b.text ?? "")}</div>
                                                    </div>
                                                );
                                            }

                                            if (b.type === "TEXT") {
                                                return (
                                                    <div key={b.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
                                                        <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">{String(b.text ?? "")}</p>
                                                    </div>
                                                );
                                            }

                                            if (b.type === "IMAGE_SLIDER") {
                                                const imgs = Array.isArray(b.images) ? b.images : [];
                                                return (
                                                    <div key={b.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
                                                        {b.title ? <div className="text-sm font-extrabold text-neutral-900">{String(b.title)}</div> : null}

                                                        {b.description ? (
                                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">{String(b.description)}</p>
                                                        ) : null}

                                                        {imgs.length ? (
                                                            <div className="mt-4 flex gap-3 overflow-x-auto">
                                                                {imgs.map((x: any, i: number) => {
                                                                    const src = String(x?.path ?? "").trim(); // 일단 path/url 그대로 사용
                                                                    if (!src) return null;
                                                                    return (
                                                                        <div key={`${b.id}-${i}`} className="shrink-0 w-[280px]">
                                                                            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                                                                                <div className="aspect-[16/10] w-full">
                                                                                    <img src={src} alt={x?.caption ?? ""} className="h-full w-full object-cover" />
                                                                                </div>
                                                                            </div>

                                                                            {x?.caption ? (
                                                                                <div className="mt-2 text-xs font-semibold text-neutral-600">{String(x.caption)}</div>
                                                                            ) : null}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="mt-3 text-sm text-neutral-400">등록된 이미지가 없습니다.</div>
                                                        )}
                                                    </div>
                                                );
                                            }

                                            return null;
                                        })}
                                    </div>
                                ) : null}

                                {/* 상품 소개 (설명) */}
                                <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
                                    <div className="text-sm font-extrabold text-neutral-900">상품 소개</div>
                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                                        {product?.description || "(임시) 아직 상품 소개가 없습니다."}
                                    </p>
                                </div>
                            </section>

                            {/* ✅ 여행자 보험 */}
                            {insuranceEnabled ? (
                                <section
                                    id="insurance"
                                    ref={(el) => {
                                        refs.current.insurance = el;
                                    }}
                                    className="scroll-mt-36"
                                >
                                    <h2 className="text-lg font-extrabold text-neutral-900">여행자 보험</h2>

                                    <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
                                        <div className="text-sm font-extrabold text-neutral-900">안내</div>
                                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                                            {String((product as any)?.travelInsuranceContent ?? "")}
                                        </p>
                                    </div>
                                </section>
                            ) : null}

                            {/* 약관/환불규정 */}
                            <section
                                id="policy"
                                ref={(el) => {
                                    refs.current.policy = el;
                                }}
                                className="scroll-mt-36"
                            >
                                <h2 className="text-lg font-extrabold text-neutral-900">약관/환불규정</h2>
                                <div className="mt-4 space-y-3">
                                    <PolicyAccordion />
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

/* ====================== 약관/환불규정 아코디언 ====================== */
const POLICY_ITEMS = [
    {
        title: "여행계약",
        content: `1. 여행계약은 여행자가 여행업자에게 여행의 예약을 하고 여행업자가 이를 승낙함으로써 성립합니다.\n\n2. 여행업자는 여행자에게 여행 일정, 여행사업자의 등록번호·상호·소재지 및 관광진흥법에 의한 영업보증보험 등의 가입에 관한 사항 등 여행계약서와 약관 및 여행조건 설명서를 교부하여야 합니다.\n\n3. 여행업자는 여행출발 전 여행자에게 여행일정표와 여행약관을 서면 또는 전자문서로 교부하여야 합니다.`,
    },
    {
        title: "예약금 및 잔금",
        content: `1. 예약금: 여행요금의 10% 이상 (상품에 따라 상이)\n\n2. 잔금: 여행 출발 7일 전까지 완납\n※ 성수기 및 연휴기간 상품의 경우 잔금 납부일이 상이할 수 있습니다.\n\n3. 예약금 입금 후 예약이 확정되며, 잔금 미납 시 예약이 취소될 수 있습니다.`,
    },
    {
        title: "취소/환불 규정",
        isRefundTable: true,
    },
    {
        title: "여행자 의무사항",
        content: `1. 여행자는 여행 출발 전까지 여권, 비자 등 여행에 필요한 서류를 구비해야 합니다.\n\n2. 여행자는 여행 중 여행업자의 안내에 따라야 하며, 여행 일정을 임의로 변경하여서는 안됩니다.\n\n3. 여행자의 귀책사유로 인하여 발생한 추가 비용은 여행자가 부담합니다.\n\n4. 여행자는 여행 중 타인에게 피해를 주는 행위를 하여서는 안됩니다.`,
    },
    {
        title: "여행사 책임",
        content: `1. 여행업자는 여행 출발 시부터 도착 시까지 여행자의 안전에 대하여 주의를 기울여야 합니다.\n\n2. 여행업자는 여행자에게 안전에 관한 정보를 제공하여야 합니다.\n\n3. 여행업자는 고의 또는 과실로 여행자에게 손해를 가한 경우 손해를 배상할 책임이 있습니다.\n\n4. 천재지변, 전쟁, 정부의 명령, 운송·숙박기관의 파업 등 불가항력적인 사유로 인하여 여행일정이 변경되거나 여행이 불가능해진 경우에는 책임을 지지 않습니다.`,
    },
    {
        title: "개인정보 수집 및 이용",
        content: `1. 수집항목: 성명, 연락처, 여권정보, 결제정보 등\n\n2. 수집목적: 여행상품 예약 및 서비스 제공, 고객상담, 마케팅 및 이벤트 안내\n\n3. 보유기간: 서비스 제공 완료 후 관련 법령에 따른 보유기간까지\n\n4. 여행자는 개인정보 수집에 대한 동의를 거부할 권리가 있으나, 동의를 거부할 경우 여행상품 예약이 제한될 수 있습니다.`,
    },
];

const REFUND_TABLE = [
    { period: "여행 시작 30일 전까지", rate: "전액 환불" },
    { period: "여행 시작 29일 ~ 20일 전", rate: "여행요금의 10% 배상" },
    { period: "여행 시작 19일 ~ 10일 전", rate: "여행요금의 15% 배상" },
    { period: "여행 시작 9일 ~ 8일 전", rate: "여행요금의 20% 배상" },
    { period: "여행 시작 7일 ~ 1일 전", rate: "여행요금의 30% 배상" },
    { period: "여행 당일 취소", rate: "여행요금의 50% 배상" },
];

function PolicyAccordion() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-2">
            {POLICY_ITEMS.map((item, index) => (
                <div key={index} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                    <button
                        type="button"
                        onClick={() => toggle(index)}
                        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-neutral-50"
                    >
                        <span className="text-sm font-bold text-neutral-900">{item.title}</span>
                        <svg
                            className={`h-5 w-5 text-neutral-400 transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {openIndex === index && (
                        <div className="border-t border-neutral-200 px-5 py-4">
                            {item.isRefundTable ? (
                                <div>
                                    <p className="mb-4 text-sm leading-6 text-neutral-600">
                                        여행자의 여행계약 해제 요청이 있는 경우, 여행업자는 아래 기준에 따라 취소료를 공제 후
                                        환불합니다.
                                    </p>
                                    <div className="overflow-hidden rounded-xl border border-neutral-200">
                                        <table className="w-full text-sm">
                                            <thead className="bg-neutral-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-bold text-neutral-700">취소 시점</th>
                                                    <th className="px-4 py-3 text-left font-bold text-neutral-700">환불 기준</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-200">
                                                {REFUND_TABLE.map((row, i) => (
                                                    <tr key={i} className={i % 2 === 1 ? "bg-neutral-50" : ""}>
                                                        <td className="px-4 py-3 text-neutral-600">{row.period}</td>
                                                        <td className="px-4 py-3 text-neutral-600">{row.rate}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="mt-4 text-xs leading-5 text-neutral-500">
                                        ※ 항공권, 숙박 등 선결제된 비용은 해당 업체의 환불규정에 따릅니다.
                                        <br />
                                        ※ 성수기(명절, 연휴 등)에는 별도의 취소 규정이 적용될 수 있습니다.
                                        <br />※ 여행자의 개별 귀책사유로 인한 취소 시 실비용이 추가 공제될 수 있습니다.
                                    </p>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-600">{item.content}</p>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
