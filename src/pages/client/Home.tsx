import { Link } from "react-router-dom";
import { useMemo } from "react";
import Container from "../../components/common/Container";
import MobileSnapCarousel from "../../components/common/MobileSnapCarousel";
import { useProducts } from "../../hooks/useProducts";
import type { Product } from "../../types/product";
import HScroll from "../../components/common/HScroll";

type Card = {
    id: string;
    title: string;
    price: string;
    img: string;
    badge?: string;
};

const heroSideCards: Card[] = [
    {
        id: "hero-1",
        title: "[얼리버드] 오키나와 실속 호텔+골프",
        price: "979,000원~",
        img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
        badge: "오키나와",
    },
    {
        id: "hero-2",
        title: "[얼리버드] 미야코지마 브릿지베이",
        price: "1,059,000원~",
        img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
        badge: "미야코지마",
    },
];

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
            <h2 className="text-xl font-extrabold tracking-tight text-neutral-900">{left}</h2>
            {right ? <p className="text-sm text-neutral-500">{right}</p> : null}
        </div>
    );
}

function ProductCard({ item }: { item: Card }) {
    return (
        <Link
            to={`/product/${item.id}`}
            state={{ product: item }}
            className="block"
        >
            <article className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="relative">
                    {/* ✅ 썸네일 “짤림 느낌” 줄이기: 높이 고정 대신 aspect로 */}
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
                            // 카드 클릭 라우팅 막지 않도록
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

                <div className="p-4">
                    <div className="line-clamp-2 text-sm font-semibold text-neutral-900">{item.title}</div>
                    <div className="mt-2 text-sm font-extrabold text-neutral-900">{item.price}</div>
                </div>
            </article>
        </Link>
    );
}

export default function Home() {
    // ✅ Admin에서 만든 데이터가 홈에서도 보이게: mock DB(listPublishedProducts) 기반
    // - 지금 단계에서는 PUBLISHED만 홈에 노출
    const productsQuery = useProducts();
    const published = useMemo(() => {
        const items = productsQuery.data ?? [];
        return items.filter((p) => p.status === "PUBLISHED");
    }, [productsQuery.data]);

    // 섹션별로 4개씩 뽑아 쓰기 (원하면 region/태그 기반으로 더 세분화 가능)
    const homeCards = useMemo(() => published.map(toCard), [published]);
    const specialCards = homeCards.slice(0, 4);
    const onsenTopCards = homeCards.slice(4, 8).length ? homeCards.slice(4, 8) : homeCards.slice(0, 4);

    return (
        <main className="bg-white">
            <Container>
                {/* HERO */}
                <section className="py-8 md:py-10">
                    <div className="-mx-6">
                        <div className="px-6">
                            <div className="grid grid-cols-12 items-stretch gap-6 md:gap-10">
                                {/* LEFT */}
                                <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
                                    <div className="mx-auto w-full max-w-[520px] md:mx-0">
                                        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-[#1C8B7B]">
                                            추운 겨울에도 따뜻하게,
                                            <br />
                                            남국 겨울 골프 🎁 🏝️
                                        </h1>

                                        <p className="mt-3 text-sm text-neutral-500">
                                            #겨울골프 #남국골프 #오키나와골프 #미야코지마골프
                                        </p>

                                        <div className="mt-6 space-y-3">
                                            {heroSideCards.map((c) => (
                                                <div
                                                    key={c.id}
                                                    className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md"
                                                >
                                                    <div className="w-20 overflow-hidden rounded-xl">
                                                        <div className="aspect-[16/10] w-full overflow-hidden">
                                                            <img src={c.img} alt={c.title} className="h-full w-full object-cover object-center" />
                                                        </div>
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {c.badge ? (
                                                                <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                                  {c.badge}
                                </span>
                                                            ) : null}
                                                            <span className="rounded-md bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700">
                                시내호텔
                              </span>
                                                            <span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] font-bold text-neutral-700">
                                다색골프
                              </span>
                                                        </div>

                                                        <div className="mt-2 line-clamp-1 text-sm font-semibold text-neutral-900">{c.title}</div>
                                                        <div className="mt-1 text-sm font-extrabold text-neutral-900">{c.price}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 flex items-center gap-2 text-xs text-neutral-500">
                                            <span className="font-semibold">01 / 03</span>
                                            <button
                                                className="grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50"
                                                type="button"
                                            >
                                                ‹
                                            </button>
                                            <button
                                                className="grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50"
                                                type="button"
                                            >
                                                ›
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT */}
                                <div className="col-span-12 md:col-span-6">
                                    <div className="h-[280px] md:h-[520px] w-full overflow-hidden rounded-3xl">
                                        <img
                                            className="h-full w-full object-cover"
                                            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=80"
                                            alt="hero"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SPECIAL */}
                <section className="py-8 md:py-10">
                    <SectionTitle left="특가 🔥 얼리버드 골프" />

                    {productsQuery.isLoading ? (
                        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
                            상품 불러오는 중...
                        </div>
                    ) : specialCards.length === 0 ? (
                        <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
                            아직 노출(PUBLISHED) 상품이 없습니다. 어드민에서 상품을 등록/노출로 바꿔주세요.
                        </div>
                    ) : (
                        <>
                            {/* Desktop grid */}
                            <div className="mt-6 hidden md:grid md:grid-cols-4 md:gap-6">
                                {specialCards.map((p) => (
                                    <ProductCard key={p.id} item={p} />
                                ))}
                            </div>

                            {/* Mobile carousel */}
                            <div className="mt-6 md:hidden">
                                <MobileSnapCarousel items={specialCards} renderItem={(p) => <ProductCard item={p} />} />
                            </div>
                        </>
                    )}
                </section>

                {/* ONSEN */}
                <section className="py-8 md:py-10">
                    <div className="flex items-center justify-center gap-2">
                        <h3 className="text-base font-extrabold text-neutral-900">골프여행, 고르기 어려울 땐 🤔 ?</h3>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-2">
                        {["오키나와", "시내호텔", "가성비", "프리미엄"].map((t) => (
                            <button
                                key={t}
                                type="button"
                                className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Desktop grid */}
                    <div className="mt-8 hidden md:grid md:grid-cols-4 md:gap-6">
                        {onsenTopCards.map((p) => (
                            <ProductCard key={p.id} item={p} />
                        ))}
                    </div>

                    {/* Mobile carousel + dots */}
                    <div className="mt-8 md:hidden">
                        <MobileSnapCarousel
                            items={onsenTopCards}
                            renderItem={(p) => <ProductCard item={p} />}
                        />
                    </div>
                </section>

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
                            <p className="mt-2 text-sm text-neutral-500">
                                따뜻한 온천욕과 가이세키 코스 요리로 온천골프 만끽 🥰
                            </p>

                            <div className="mt-6 space-y-4">
                                {onsenTopCards.slice(0, 2).map((c) => (
                                    <Link
                                        key={c.id}
                                        to={`/product/${c.id}`}
                                        state={{ product: c }}
                                        className="block"
                                    >
                                        <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md">
                                            <div className="w-20 overflow-hidden rounded-xl">
                                                <div className="aspect-[16/10] w-full overflow-hidden">
                                                    <img src={c.img} alt={c.title} className="h-full w-full object-cover object-center" />
                                                </div>
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                          <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                            {c.badge ?? "추천"}
                          </span>
                                                    <span className="rounded-md bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700">
                            상품
                          </span>
                                                </div>
                                                <div className="mt-2 line-clamp-1 text-sm font-semibold text-neutral-900">{c.title}</div>
                                                <div className="mt-1 text-sm font-extrabold text-neutral-900">{c.price}</div>
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

            {/* Footer 컴포넌트 쓰면 이건 삭제 가능 */}
            <div className="border-t border-neutral-200 bg-neutral-50">
                <div className="mx-auto max-w-[1400px] px-6 py-10 text-sm text-neutral-500">
                    하단 영역은 Footer 컴포넌트에서 대체하면 됩니다.
                </div>
            </div>
        </main>
    );
}
