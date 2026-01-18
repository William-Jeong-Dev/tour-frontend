export default function Hero() {
    return (
        <section className="mt-8 overflow-hidden rounded-3xl border border-neutral-900 bg-gradient-to-b from-neutral-900 to-neutral-950">
            <div className="grid gap-6 p-8 lg:grid-cols-2 lg:items-center">
                <div>
                    <p className="text-sm text-neutral-300">프리미엄 여행 · 맞춤 컨시어지</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                        당신만의 여행을
                        <br />
                        간단하게 완성하세요
                    </h1>
                    <p className="mt-3 max-w-prose text-neutral-300">
                        지역/예산/취향 기반으로 추천 상품과 일정을 빠르게 제공합니다.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <button className="rounded-full bg-neutral-50 px-5 py-2 text-sm font-semibold text-neutral-950">
                            상담하기
                        </button>
                        <button className="rounded-full border border-neutral-800 px-5 py-2 text-sm text-neutral-200 hover:bg-neutral-900">
                            상품 보기
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-neutral-800">
                        <img
                            alt=""
                            className="h-full w-full object-cover"
                            src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1600&q=60"
                            loading="lazy"
                        />
                    </div>
                    <div className="pointer-events-none absolute -bottom-4 -left-4 rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 text-sm text-neutral-200 backdrop-blur">
                        ✨ 추천 일정 · 빠른 견적
                    </div>
                </div>
            </div>
        </section>
    );
}
