import type { LoaderFunctionArgs } from "react-router-dom";
import { Link, useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const THUMB_BUCKET = "product-thumbnails";

type Theme = {
    id: string;
    name: string;
    slug: string;
};

type Area = {
    id: string;
    theme_id: string;
    name: string;
    slug: string;
    sort_order: number | null;
    is_active: boolean;
};

type Product = {
    id: string;
    title: string | null;
    subtitle: string | null;
    region: string | null; // 레거시 표시용 (있으면 그대로 사용)
    status: string | null;
    price_text: string | null;
    thumbnail_url: string | null;
    updated_at: string | null;
    theme_id: string | null;
    area_id?: string | null; // ✅ 추가
};

type LoaderData = {
    theme: Theme;
    areas: Area[];
    products: Product[];
};

function slugifyKoreanLoose(input: string) {
    // DB slug 규칙이 이미 정해져 있으면 이 함수는 필요없음.
    // 여기서는 query string area=slug 를 그대로 씀.
    return (input ?? "").trim();
}

// public bucket용 썸네일 URL 만들기
function toPublicThumbUrl(raw: string | null) {
    const v = String(raw ?? "").trim();
    if (!v) return "";

    // 외부 URL이면 그대로
    if (/^https?:\/\//i.test(v)) return v;

    // 앞 / 제거
    let path = v.replace(/^\/+/, "");

    // 혹시 "product-thumbnails/..." 같이 들어오면 bucket prefix 제거
    const prefix = `${THUMB_BUCKET}/`;
    if (path.startsWith(prefix)) path = path.slice(prefix.length);

    const { data } = supabase.storage.from(THUMB_BUCKET).getPublicUrl(path);
    return data?.publicUrl ?? "";
}

export async function themeProductsLoader({ params, request }: LoaderFunctionArgs) {
    const slug = params.slug;
    if (!slug) throw new Response("slug is required", { status: 400 });

    const url = new URL(request.url);
    const areaSlug = (url.searchParams.get("area") ?? "").trim(); // ✅ /theme/:slug?area=...

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

    const theme = themeRes.data as Theme;

    // 2) 해당 theme의 areas
    const areasRes = await supabase
        .from("product_areas")
        .select("id,theme_id,name,slug,sort_order,is_active")
        .eq("theme_id", theme.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

    if (areasRes.error) {
        console.error("[areas] load error:", areasRes.error);
        throw new Response("Failed to load areas", { status: 500 });
    }

    const areas = (areasRes.data ?? []) as Area[];

    // 3) areaSlug -> areaId 매핑 (있을 때만)
    const selectedArea =
        areaSlug ? areas.find((a) => (a.slug ?? "").trim() === areaSlug) : undefined;

    // 4) 해당 theme 상품들 (areaId 있으면 필터)
    let productsQuery = supabase
        .from("products")
        .select("*")
        .eq("theme_id", theme.id)
        .neq("status", "DRAFT") // 고객페이지에선 초안 숨김
        .order("updated_at", { ascending: false });

    if (selectedArea?.id) {
        productsQuery = productsQuery.eq("area_id", selectedArea.id);
    }

    const productsRes = await productsQuery;

    if (productsRes.error) {
        console.error("[theme products] load error:", productsRes.error);
        throw new Response("Failed to load products", { status: 500 });
    }

    const data: LoaderData = {
        theme,
        areas,
        products: (productsRes.data ?? []) as Product[],
    };

    return data;
}

export default function ThemeProductsPage() {
    const { theme, areas, products } = useLoaderData() as LoaderData;

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentAreaSlug = (searchParams.get("area") ?? "").trim();

    const goArea = (areaSlug?: string) => {
        // ✅ url을 /theme/:slug?area=xxx 로 유지 (새로고침/공유에도 유지됨)
        const sp = new URLSearchParams(searchParams);
        if (!areaSlug) sp.delete("area");
        else sp.set("area", areaSlugify(areaSlug));
        const qs = sp.toString();
        navigate(qs ? `/theme/${theme.slug}?${qs}` : `/theme/${theme.slug}`);
    };

    const areaSlugify = (s: string) => slugifyKoreanLoose(s);

    return (
        <main className="mx-auto w-full max-w-[1400px] px-6 py-8">
            {/* 헤더 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold">{theme.name}</h1>
                    <p className="mt-1 text-sm text-black/60">총 {products.length}개 상품</p>
                </div>
                <Link to="/" className="text-sm font-semibold text-[#2E97F2] hover:underline">
                    홈으로
                </Link>
            </div>

            {/* ✅ 상단 area 필터 UI (모바일도 chips로 통일) */}
            <div className="mt-6">
                <div className="text-xs font-semibold text-neutral-600 mb-2">지역 선택</div>

                <div
                    className={[
                        "flex items-center gap-2",
                        "flex-wrap", // ✅ 모바일에서 줄바꿈
                        // 아래는 선택: 지역이 많으면 스크롤이 편하면 유지, 싫으면 제거해도 됨
                        "overflow-x-auto pb-2",
                        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                    ].join(" ")}
                >
                    <button
                        type="button"
                        onClick={() => goArea(undefined)}
                        className={[
                            "shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition",
                            !currentAreaSlug
                                ? "border-[#2E97F2] bg-[#2E97F2] text-white"
                                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                        ].join(" ")}
                    >
                        전체
                    </button>

                    {areas.map((a) => {
                        const active = currentAreaSlug === (a.slug ?? "");
                        return (
                            <button
                                key={a.id}
                                type="button"
                                onClick={() => goArea(a.slug)}
                                className={[
                                    "shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition",
                                    active
                                        ? "border-[#2E97F2] bg-[#2E97F2] text-white"
                                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                                ].join(" ")}
                            >
                                {a.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 상품 리스트 */}
            {products.length === 0 ? (
                <div className="mt-8 rounded-2xl border bg-white p-8 text-center text-sm text-black/60">
                    아직 등록된 상품이 없습니다.
                </div>
            ) : (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((p) => (
                        <Link
                            key={p.id}
                            to={`/product/${p.id}`}
                            className="group overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md"
                        >
                            <div className="aspect-[4/3] w-full overflow-hidden bg-black/5">
                                {p.thumbnail_url ? (
                                    <img
                                        src={toPublicThumbUrl(p.thumbnail_url)}
                                        alt={p.title ?? "product"}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm text-black/40">
                                        No Image
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                {/* region은 레거시(있으면 표시). area 구축 후엔 area명으로 바꾸는 것도 가능 */}
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
