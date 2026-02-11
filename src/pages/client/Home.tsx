import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import Container from "../../components/common/Container";
import MobileSnapCarousel from "../../components/common/MobileSnapCarousel";
import { useProducts } from "../../hooks/useProducts";
import type { Product } from "../../types/product";

import { useHeroSlides } from "../../hooks/useHeroSlides";
import { defaultHeroSlides } from "./HomeHeroDefaults";
import { getPublicSiteAssetUrl } from "../../api/siteSettings.api";

// ✅ 팝업
import SitePopup from "../../components/popup/SitePopup";
import { listActivePopupsForClient, type PopupRow } from "../../api/popups.client";

import { useHomeOnsenSection, useHomeSpecialSection } from "../../hooks/useHomeSections";

import { DesktopCarousel } from "../../components/common/DesktopCarousel";

type Card = {
    id: string;
    title: string;
    price: string;
    img: string;
    badge?: string;
};

function toCard(p: Product): Card {
    return {
        id: p.id,
        title: p.title,
        price: p.priceText || "상담 문의",
        img:
            p.thumbnailUrl ||
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
        badge: p.region || undefined,
    };
}

function SectionTitle({ left, right }: { left: string; right?: string }) {
    return (
        <div className="flex items-end justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900">{left}</h2>
            {right ? <p className="text-base text-neutral-500">{right}</p> : null}
        </div>
    );
}

function ProductCard({ item }: { item: Card }) {
    return (
        <Link to={`/product/${item.id}`} state={{ product: item }} className="block">
            <article className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="relative">
                    <div className="aspect-[16/10] w-full overflow-hidden">
                        <img
                            className="h-full w-full object-cover object-center transition group-hover:scale-[1.02]"
                            src={item.img}
                            alt={item.title}
                        />
                    </div>

                    <button
                        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
                        type="button"
                        aria-label="like"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            alert("찜(데모)");
                        }}
                    >
                        ♡
                    </button>

                    {item.badge ? (
                        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-neutral-800">
              {item.badge}
            </span>
                    ) : null}
                </div>

                <div className="p-4 flex min-h-[86px] min-w-0 flex-col justify-between">
                    <div className="min-w-0 text-base font-semibold text-neutral-900 overflow-hidden text-ellipsis whitespace-nowrap">
                        {item.title}
                    </div>
                    <div className="mt-2 text-base font-extrabold text-neutral-900">
                        {item.price}
                    </div>
                </div>

            </article>
        </Link>
    );
}

export default function Home() {
    const productsQuery = useProducts();

    const specialCfgQ = useHomeSpecialSection();
    const onsenCfgQ = useHomeOnsenSection();

    const specialCfg = specialCfgQ.data;
    const onsenCfg = onsenCfgQ.data;

    const published = useMemo(() => {
        const items = productsQuery.data ?? [];
        return items.filter((p) => p.status === "PUBLISHED");
    }, [productsQuery.data]);

    const homeCards = useMemo(() => published.map(toCard), [published]);

    const byId = useMemo(() => {
        const m = new Map<string, Card>();
        homeCards.forEach((c) => m.set(c.id, c));
        return m;
    }, [homeCards]);

    const specialCards = useMemo(() => {
        const fallback = homeCards;

        if (!specialCfg) return fallback;
        if (!specialCfg.productIds?.length) return fallback;

        return specialCfg.productIds
            .map((id) => byId.get(id))
            .filter(Boolean) as Card[];
    }, [homeCards, specialCfg, byId]);

    const onsenTopCards = useMemo(() => {
        const fallback = homeCards.slice(4, 12).length ? homeCards.slice(4, 12) : homeCards.slice(0, 8);

        if (!onsenCfg) return fallback;
        if (!onsenCfg.productIds?.length) return fallback;

        const picked = onsenCfg.productIds
            .map((id) => byId.get(id))
            .filter(Boolean) as Card[];

        return picked.length ? picked : fallback;
    }, [homeCards, onsenCfg, byId]);

    // ✅ HERO 슬라이드: DB에서 읽고 없으면 defaultHeroSlides 사용
    const heroQuery = useHeroSlides(defaultHeroSlides);
    const slides = heroQuery.slides ?? defaultHeroSlides; // 안전장치

    const [heroIndex, setHeroIndex] = useState(0);
    const intervalRef = useRef<number | null>(null);

    // ✅ 팝업
    const [popups, setPopups] = useState<PopupRow[]>([]);
    const [popupIdx, setPopupIdx] = useState(0);

    const currentPopup = popups[popupIdx] ?? null;

    const hideKey = (id: string) => `hide_popup_${id}_${new Date().toISOString().slice(0, 10)}`; // 하루 단위

    useEffect(() => {
        (async () => {
            try {
                const rows = await listActivePopupsForClient();

                // 오늘 하루 숨김 처리된 팝업은 제외
                const filtered = rows.filter((p) => !localStorage.getItem(hideKey(p.id)));
                setPopups(filtered);
                setPopupIdx(0);
            } catch (e) {
                console.error("[HOME] popup load failed", e);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // slides 길이가 바뀌면 index가 범위 밖으로 나가지 않게 보정
    useEffect(() => {
        if (!slides.length) return;
        setHeroIndex((v) => Math.min(v, slides.length - 1));
    }, [slides.length]);

    const goTo = (i: number) => {
        if (!slides.length) return;
        setHeroIndex((i + slides.length) % slides.length);
    };
    const next = () => goTo(heroIndex + 1);
    const prev = () => goTo(heroIndex - 1);

    const active = slides.length ? slides[heroIndex] : defaultHeroSlides[0];

    const AUTO_MS = 5000;

    const stopAuto = () => {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
    };

    const startAuto = () => {
        stopAuto();
        if (slides.length <= 1) return;

        intervalRef.current = window.setInterval(() => {
            setHeroIndex((v) => (v + 1) % slides.length);
        }, AUTO_MS);
    };

    useEffect(() => {
        startAuto();
        return stopAuto;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slides.length]);


    return (
        <main className="bg-white">
            {/* ✅ POPUP (홈 진입 시 자동 표시) */}
            {currentPopup ? (
                <SitePopup
                    id={currentPopup.id}
                    title={currentPopup.title}
                    leftPx={currentPopup.left_px ?? 0}
                    topPx={currentPopup.top_px ?? 0}
                    widthPx={currentPopup.width_px ?? 400}
                    contentHtml={currentPopup.content_html ?? ""}
                    onClose={() => {
                        // ✅ 닫으면 다음 팝업으로 (없으면 종료)
                        setPopupIdx((i) => i + 1);
                    }}
                    onHideToday={() => {
                        localStorage.setItem(hideKey(currentPopup.id), "1");
                    }}
                />
            ) : null}

            {/* ✅ HERO */}
            <section className="w-screen bg-white -mt-px overflow-hidden">
                <div className="grid grid-cols-12 items-stretch gap-0 min-h-[calc(92vh-var(--header-h,140px)+12px)]">
                    {/* LEFT - 모바일에서는 이미지 다음에 표시 */}
                    <div className="col-span-12 md:col-span-5 flex justify-end order-last md:order-first">
                        <div className="w-full max-w-[1400px] px-6 py-4 md:py-0">
                            <div className="md:h-full md:flex md:items-center">
                                <div className="w-full max-w-[580px] ml-0 md:ml-16 lg:ml-24 xl:ml-28 flex flex-col justify-center items-start text-left">
                                    <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-[#2E97F2]">
                                        {active.title.split("\n").map((line, idx) => (
                                            <span key={idx}>
                        {line}
                                                <br />
                      </span>
                                        ))}
                                    </h1>

                                    <p className="mt-3 text-sm md:text-base text-neutral-500">{active.tags}</p>

                                    <div className="mt-6 space-y-3 w-full flex flex-col items-start">
                                        {active.cards.map((c) => (
                                            <div
                                                key={c.id}
                                                className="w-full max-w-[520px] flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md"
                                            >
                                                <div className="w-20 overflow-hidden rounded-xl">
                                                    <div className="aspect-[16/10] w-full overflow-hidden">
                                                        <img
                                                            src={getPublicSiteAssetUrl(c.img)}
                                                            alt={c.title}
                                                            className="h-full w-full object-cover object-center"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="min-w-0 text-left">
                                                    <div className="flex flex-wrap items-center gap-2 justify-start">
                                                        {c.badge ? (
                                                            <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs md:text-sm font-bold text-emerald-700">
                                {c.badge}
                              </span>
                                                        ) : null}
                                                        <span className="rounded-md bg-sky-50 px-2 py-1 text-xs md:text-sm font-bold text-sky-700">
                              시내호텔
                            </span>
                                                        <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs md:text-sm font-bold text-neutral-700">
                              다색골프
                            </span>
                                                    </div>

                                                    <div className="mt-2 line-clamp-1 text-sm font-semibold text-neutral-900">{c.title}</div>
                                                    <div className="mt-1 text-sm font-extrabold text-neutral-900">{c.price}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex items-center gap-2 text-sm text-neutral-500">
                    <span className="font-semibold">
                      {String(heroIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                    </span>

                                        <button
                                            className="grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50"
                                            type="button"
                                            aria-label="prev"
                                            onClick={() => {
                                                stopAuto();
                                                prev();
                                                startAuto();
                                            }}
                                        >
                                            ‹
                                        </button>

                                        <button
                                            className="grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50"
                                            type="button"
                                            aria-label="next"
                                            onClick={() => {
                                                stopAuto();
                                                next();
                                                startAuto();
                                            }}
                                        >
                                            ›
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="col-span-12 md:col-span-7">
                        <div
                            className="
                relative w-full overflow-hidden
                h-[240px] sm:h-[300px]
                md:h-full
                bg-neutral-900
              "
                            onMouseEnter={stopAuto}
                            onMouseLeave={startAuto}
                        >
                            {slides.map((s, i) => (
                                <img
                                    key={s.id}
                                    className={[
                                        "absolute inset-0 w-full h-full transition-opacity duration-700",
                                        i === heroIndex ? "opacity-100" : "opacity-0",
                                        "object-cover object-[50%_35%] md:object-center",
                                        "object-center",
                                    ].join(" ")}
                                    src={getPublicSiteAssetUrl(s.heroImage)}
                                    alt={s.title}
                                    draggable={false}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ✅ HERO 아래부터는 Container */}
            <Container>
                {/* SPECIAL */}
                {specialCfg?.enabled !== false ? (
                    <section className="py-7 md:py-9">
                        <SectionTitle left={specialCfg?.title || "🚩대표가 직접 고른 가성비 일정"} />

                        {productsQuery.isLoading ? (
                            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
                                상품 불러오는 중...
                            </div>
                        ) : specialCards.length === 0 ? (
                            <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
                                아직 노출(PUBLISHED) 상품이 없습니다. 어드민에서 상품을 등록/노출로 바꿔주세요.
                            </div>
                        ) : specialCards.length <= 4 ? (
                            <>
                                {/* DESKTOP GRID */}
                                <div className="mt-6 hidden md:grid md:grid-cols-4 md:gap-6">
                                    {specialCards.map((p) => (
                                        <ProductCard key={p.id} item={p} />
                                    ))}
                                </div>

                                {/* MOBILE SLIDE */}
                                <div className="mt-6 md:hidden">
                                    <MobileSnapCarousel items={specialCards} renderItem={(p) => <ProductCard item={p} />} />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* DESKTOP: ARROW CAROUSEL (크기 고정) */}
                                <div className="mt-6 hidden md:block">
                                    <DesktopCarousel
                                        items={specialCards}
                                        renderItem={(p) => (
                                            <div className="w-[260px] shrink-0 md:w-[280px]">
                                                <ProductCard item={p} />
                                            </div>
                                        )}
                                    />
                                </div>

                                {/* MOBILE: 기존 스냅 캐러셀 */}
                                <div className="mt-6 md:hidden">
                                    <MobileSnapCarousel items={specialCards} renderItem={(p) => <ProductCard item={p} />} />
                                </div>
                            </>
                        )}
                    </section>
                ) : null}

                {/* ONSEN */}
                {/* ONSEN */}
                {onsenCfg?.enabled !== false ? (
                    <section className="py-7 md:py-9">
                        <div className="flex items-center justify-center gap-2">
                            <h3 className="text-lg md:text-xl font-extrabold text-neutral-900">
                                {onsenCfg?.title || "골프여행, 고민하지 마세요"}
                            </h3>
                        </div>

                        <div className="mt-3 flex items-center justify-center gap-2">
                            {(onsenCfg?.tags?.length ? onsenCfg.tags : ["특가일정", "2인골프", "온천포함", "시내호텔"]).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {onsenTopCards.length <= 4 ? (
                            <>
                                {/* DESKTOP GRID */}
                                <div className="mt-8 hidden md:grid md:grid-cols-4 md:gap-6">
                                    {onsenTopCards.map((p) => (
                                        <ProductCard key={p.id} item={p} />
                                    ))}
                                </div>

                                {/* MOBILE SLIDE */}
                                <div className="mt-8 md:hidden">
                                    <MobileSnapCarousel items={onsenTopCards} renderItem={(p) => <ProductCard item={p} />} />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* DESKTOP SLIDE */}
                                <div className="mt-8 hidden md:block">
                                    <DesktopCarousel
                                        items={onsenTopCards}
                                        renderItem={(p) => (
                                            <div className="w-[260px] shrink-0 md:w-[280px] h-full">
                                                <ProductCard item={p} />
                                            </div>
                                        )}
                                    />
                                </div>

                                {/* MOBILE SLIDE */}
                                <div className="mt-8 md:hidden">
                                    <MobileSnapCarousel items={onsenTopCards} renderItem={(p) => <ProductCard item={p} />} />
                                </div>
                            </>
                        )}
                    </section>
                ) : null}

                {/* BIG FEATURE */}
                <section className="py-8 md:py-10 pb-12 md:pb-16">
                    <div className="grid grid-cols-12 items-start gap-6 md:gap-10">
                        <div className="col-span-12 md:col-span-6">
                            <div className="overflow-hidden rounded-3xl">
                                <img
                                    className="h-[260px] md:h-[380px] w-full object-cover"
                                    src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80"
                                    alt="feature"
                                />
                            </div>
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <h3 className="text-2xl font-extrabold text-neutral-900">따끈따끈 온천 골프 ⛳️</h3>
                            <p className="mt-2 text-base text-neutral-500">
                                따뜻한 온천욕과 가이세키 코스 요리로 온천골프 만끽 🥰
                            </p>

                            <div className="mt-6 space-y-4">
                                {onsenTopCards.slice(0, 2).map((c) => (
                                    <Link key={c.id} to={`/product/${c.id}`} state={{ product: c }} className="block">
                                        <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md">
                                            <div className="w-20 overflow-hidden rounded-xl">
                                                <div className="aspect-[16/10] w-full overflow-hidden">
                                                    <img
                                                        src={getPublicSiteAssetUrl(c.img)}
                                                        alt={c.title}
                                                        className="h-full w-full object-cover object-center"
                                                    />
                                                </div>
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                          <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs md:text-sm font-bold text-emerald-700">
                            {c.badge ?? "추천"}
                          </span>
                                                    <span className="rounded-md bg-sky-50 px-2 py-1 text-xs md:text-sm font-bold text-sky-700">
                            상품
                          </span>
                                                </div>
                                                <div className="mt-2 line-clamp-1 text-base font-semibold text-neutral-900">{c.title}</div>
                                                <div className="mt-1 text-base font-extrabold text-neutral-900">{c.price}</div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-6 flex items-center gap-3 text-neutral-400">
                                <button
                                    type="button"
                                    className="grid h-9 w-9 place-items-center rounded-full border border-neutral-200 bg-white hover:bg-neutral-50"
                                >
                                    ←
                                </button>
                                <button
                                    type="button"
                                    className="grid h-9 w-9 place-items-center rounded-full border border-neutral-200 bg-white hover:bg-neutral-50"
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </Container>

            <div className="border-t border-neutral-200 bg-neutral-50">
                <div className="mx-auto max-w-[1400px] px-6 py-10 text-sm text-neutral-500">
                    하단 영역은 Footer 컴포넌트에서 대체하면 됩니다.
                </div>
            </div>
        </main>
    );
}