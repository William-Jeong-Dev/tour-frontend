import { Link } from "react-router-dom";

export default function HeroSplit() {
    return (
        <section className="w-full">
            <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-2">
                {/* Left */}
                <div className="bg-white flex items-center justify-center px-6 py-16">
                    <div className="max-w-md text-center">
                        <div className="inline-flex items-center gap-2 text-xs text-neutral-400">
                            <span className="h-2 w-2 rounded-full bg-[#2E97F2]" />
                            <span>프리미엄 여행 · 맞춤 컨시어지</span>
                        </div>

                        <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-[#2E97F2]">
                            추운 겨울에도 따뜻하게,
                            <br />
                            남국 겨울 골프 🎁 🏝️
                        </h1>

                        <p className="mt-3 text-sm text-neutral-500">
                            #겨울골프 #남국골프 #오키나와골프 #마카오 #미야코지마
                        </p>

                        <div className="mt-7 flex justify-center gap-2">
                            <button className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-neutral-900 hover:bg-yellow-300">
                                1:1 맞춤견적
                            </button>
                            <Link
                                to="#"
                                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-neutral-50"
                            >
                                상품 보기
                            </Link>
                        </div>

                        {/* 왼쪽 미니 리스트 */}
                        <div className="mt-10 space-y-3 text-left">
                            <MiniRow rank={1} title="[얼리버드] 오키나와 실속 호텔+골프" price="979,000원~" />
                            <MiniRow rank={2} title="[얼리버드] 미야코지마 브릿지뷰" price="1,059,000원~" />
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-3 text-xs text-neutral-400">
                            <span>01 / 03</span>
                            <button className="rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-50">‹</button>
                            <button className="rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-50">›</button>
                        </div>
                    </div>
                </div>

                {/* Right */}
                <div className="relative min-h-[560px]">
                    <img
                        src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=2200&q=60"
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                </div>
            </div>
        </section>
    );
}

function MiniRow({ rank, title, price }: { rank: number; title: string; price: string }) {
    return (
        <div className="flex gap-3">
            <div className="relative h-16 w-28 overflow-hidden rounded-lg bg-neutral-200">
                <div className="absolute left-2 top-2 rounded bg-neutral-900/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {rank}
                </div>
            </div>
            <div className="flex-1">
                <div className="flex flex-wrap gap-1">
          <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
            오키나와
          </span>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            시내호텔
          </span>
                    <span className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600">
            프리미엄
          </span>
                </div>
                <div className="mt-1 line-clamp-1 text-sm font-semibold text-neutral-900">
                    {title}
                </div>
                <div className="mt-1 text-sm font-extrabold text-neutral-900">{price}</div>
            </div>
        </div>
    );
}
