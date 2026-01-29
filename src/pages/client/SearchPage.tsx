import { useSearchParams, Link } from "react-router-dom";
import Container from "../../components/common/Container";
import { useSearchProducts } from "../../hooks/useSearchProducts";
import { getPublicSiteAssetUrl } from "../../api/siteSettings.api";
import { getPublicProductThumbUrl } from "../../api/siteSettings.api";

export default function SearchPage() {
    const [params] = useSearchParams();
    const q = params.get("q") ?? "";

    const { data, isLoading, error } = useSearchProducts(q);

    return (
        <main className="bg-white">
            <Container>
                <section className="py-8">
                    <h1 className="text-2xl font-extrabold text-neutral-900">검색</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        키워드: <span className="font-semibold text-neutral-900">{q || "(없음)"}</span>
                    </p>

                    {!q.trim() ? (
                        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
                            검색어를 입력해 주세요.
                        </div>
                    ) : isLoading ? (
                        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
                            검색 중...
                        </div>
                    ) : error ? (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                            검색 실패: {(error as any).message ?? String(error)}
                        </div>
                    ) : (data?.length ?? 0) === 0 ? (
                        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        <div className="mt-6 grid gap-6 md:grid-cols-4">
                            {data!.map((p) => {
                                const img = p.thumbnailUrl || p.thumbnailPath || "";
                                return (
                                    <Link key={p.id} to={`/product/${p.id}`} className="block">
                                        <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md">
                                            <div className="aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                                                {img ? (
                                                    <img
                                                        src={getPublicProductThumbUrl(img)}
                                                        alt={p.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : null}
                                            </div>
                                            <div className="p-4">
                                                <div className="line-clamp-2 text-base font-semibold text-neutral-900">{p.title}</div>
                                                <div className="mt-2 text-sm font-extrabold text-neutral-900">{p.priceText ?? "상담 문의"}</div>
                                                <div className="mt-1 text-xs text-neutral-500">{p.region ?? ""}</div>
                                            </div>
                                        </article>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </Container>
        </main>
    );
}
