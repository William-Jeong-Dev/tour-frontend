import type { LoaderFunctionArgs } from "react-router-dom";
import { Link, useLoaderData } from "react-router-dom";
import { supabase } from "../../lib/supabase"; // ✅ 경로 확인 필요

type Theme = {
    id: string;
    name: string;
    slug: string;
};

type Product = {
    id: string;
    title: string | null;
    subtitle: string | null;
    region: string | null;
    status: string | null;
    price_text: string | null;
    thumbnail_url: string | null;
    updated_at: string | null;
    theme_id: string | null;
};

type LoaderData = {
    theme: Theme;
    products: Product[];
};

export async function themeProductsLoader({ params }: LoaderFunctionArgs) {
    const slug = params.slug;
    if (!slug) throw new Response("slug is required", { status: 400 });

    // 1) theme 찾기
    const themeRes = await supabase
        .from("product_themes")
        .select("id,name,slug")
        .eq("slug", slug)
        .single();

    if (themeRes.error || !themeRes.data) {
        console.error("[theme] not found:", themeRes.error);
        throw new Response("Theme not found", { status: 404 });
    }

    // 2) 해당 theme 상품들
    const productsRes = await supabase
        .from("products")
        .select("*")
        .eq("theme_id", themeRes.data.id)
        .neq("status", "DRAFT") // 고객페이지에선 초안 숨김
        .order("updated_at", { ascending: false });

    if (productsRes.error) {
        console.error("[theme products] load error:", productsRes.error);
        throw new Response("Failed to load products", { status: 500 });
    }

    const data: LoaderData = {
        theme: themeRes.data as Theme,
        products: (productsRes.data ?? []) as Product[],
    };

    return data;
}

export default function ThemeProductsPage() {
    const { theme, products } = useLoaderData() as LoaderData;

    return (
        <main className="mx-auto w-full max-w-[1400px] px-6 py-8">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold">{theme.name}</h1>
                    <p className="mt-1 text-sm text-black/60">총 {products.length}개 상품</p>
                </div>
                <Link to="/" className="text-sm font-semibold text-[#1C8B7B] hover:underline">
                    홈으로
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="mt-8 rounded-2xl border bg-white p-8 text-center text-sm text-black/60">
                    아직 등록된 상품이 없습니다.
                </div>
            ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((p) => (
                        <Link
                            key={p.id}
                            to={`/product/${p.id}`} // ✅ 네 라우트가 /product/:id 이니까 맞음!
                            className="group overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md"
                        >
                            <div className="aspect-[4/3] w-full overflow-hidden bg-black/5">
                                {p.thumbnail_url ? (
                                    <img
                                        src={p.thumbnail_url}
                                        alt={p.title ?? "product"}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm text-black/40">
                                        No Image
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="text-xs text-black/55">{p.region ?? "지역 미지정"}</div>
                                <div className="mt-1 line-clamp-1 font-bold">{p.title ?? "제목 없음"}</div>
                                {p.subtitle ? (
                                    <div className="mt-1 line-clamp-2 text-sm text-black/60">{p.subtitle}</div>
                                ) : null}

                                {p.price_text ? (
                                    <div className="mt-3 text-sm font-extrabold">{p.price_text}</div>
                                ) : (
                                    <div className="mt-3 text-sm text-black/40">가격 정보 없음</div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
