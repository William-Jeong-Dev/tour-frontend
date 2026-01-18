import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Container from "../../components/common/Container";

type Card = {
    id: string;
    title: string;
    price: string;
    img: string;
    badge?: string;
};

export default function ProductDetail() {
    const { id } = useParams();
    const location = useLocation();
    const product = (location.state as { product?: Card } | null)?.product;

    // ✅ 상세페이지 진입 시 항상 맨 위로
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        // iOS Safari 대응 (가끔 window.scrollTo만으로 부족)
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, []);

    return (
        <main className="bg-white">
            <Container>
                {/* 상단 브레드크럼/뒤로 */}
                <div className="py-6">
                    <div className="flex items-center justify-between">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
                        >
                            ← 홈으로
                        </Link>

                        <div className="text-sm text-neutral-500">상품 ID: {id}</div>
                    </div>
                </div>

                {/* 콘텐츠 */}
                <section className="pb-14">
                    <div className="grid grid-cols-12 gap-8">
                        {/* 이미지 */}
                        <div className="col-span-12 md:col-span-7">
                            <div className="overflow-hidden rounded-3xl border border-neutral-200">
                                <div className="aspect-[16/10] w-full overflow-hidden">
                                    <img
                                        src={
                                            product?.img ??
                                            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80"
                                        }
                                        alt={product?.title ?? "product"}
                                        className="h-full w-full object-cover object-center"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 정보 */}
                        <div className="col-span-12 md:col-span-5">
                            {product?.badge ? (
                                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {product.badge}
                </span>
                            ) : null}

                            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl">
                                {product?.title ?? "상품 상세(데모)"}
                            </h1>

                            <div className="mt-3 text-xl font-extrabold text-neutral-900">
                                {product?.price ?? "가격 정보 준비중"}
                            </div>

                            <p className="mt-4 text-sm leading-6 text-neutral-600">
                                여기는 상품 디테일 페이지의 기본 골격이야. 다음 단계에서
                                “일정/포함사항/불포함/유의사항/상담 CTA/갤러리”를 추가해서 실제
                                상품처럼 만들자.
                            </p>

                            {/* CTA */}
                            <div className="mt-6 grid grid-cols-2 gap-3">
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
                                    찜하기
                                </button>
                            </div>

                            {/* 요약 카드 */}
                            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
                                <div className="text-sm font-extrabold text-neutral-900">
                                    간단 요약
                                </div>
                                <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                                    <li>• 기간: 3박 4일 (예시)</li>
                                    <li>• 포함: 숙박 + 라운딩 + 조식 (예시)</li>
                                    <li>• 출발: 부산/인천 (예시)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </Container>
        </main>
    );
}
