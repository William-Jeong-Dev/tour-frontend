import { cards } from "./mock";

export default function BannerListSection() {
    return (
        <section className="py-12">
            <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
                {/* 큰 배너 */}
                <div className="overflow-hidden rounded-3xl bg-neutral-100">
                    <img
                        alt=""
                        className="aspect-[16/9] w-full object-cover"
                        src="https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=2200&q=60"
                    />
                </div>

                {/* 우측 리스트 */}
                <div>
                    <h3 className="text-2xl font-extrabold tracking-tight">
                        따끈따끈 온천 골프 🛁 ⛳
                    </h3>
                    <p className="mt-2 text-sm text-neutral-600">
                        따뜻한 온천숙소 + 가이세키 코스까지, 온천골프 추천 🥰
                    </p>

                    <div className="mt-6 space-y-4">
                        {cards.slice(0, 2).map((x) => (
                            <div key={x.id} className="flex gap-3">
                                <div className="h-16 w-28 overflow-hidden rounded-xl bg-neutral-100">
                                    <img className="h-full w-full object-cover" src={x.image} alt="" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex gap-1">
                                        {x.tags.slice(0, 3).map((t) => (
                                            <span key={t} className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-[#2E97F2]">
                        {t}
                      </span>
                                        ))}
                                    </div>
                                    <div className="mt-1 line-clamp-1 text-sm font-semibold">{x.subtitle}</div>
                                    <div className="mt-1 text-sm font-extrabold">{x.price}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                        <div className="h-[2px] flex-1 bg-[#2E97F2]/30" />
                        <button className="rounded border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50">
                            ←
                        </button>
                        <button className="rounded border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50">
                            →
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
