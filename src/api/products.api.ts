import type { Product, ProductUpsert } from "../types/product";
import { supabase } from "../lib/supabase";

const nowIso = () => new Date().toISOString();

export function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/**
 * 정책:
 * - products.thumbnail_url 컬럼에는 "public url"이 아니라 "storage path"를 저장할 수 있음
 * - private bucket이면 화면에 보여줄 때 signed url로 변환해서 Product.thumbnailUrl로 내려준다.
 */
type ProductRow = {
    id: string;

    title: string;
    subtitle: string;
    region: string;
    nights: number;
    days: number;
    status: string;

    price_text: string;
    description: string;

    // ✅ 썸네일 (여기엔 path OR 외부 url이 들어올 수 있음)
    thumbnail_url: string; // 가능하면 NOT NULL 권장(없으면 "" 저장)
    thumbnail_path: string | null; // path만 따로 저장하고 싶으면 사용

    images: any[];

    included: any[];
    excluded: any[];
    notices: any[];

    itinerary: any[];
    departures: any[];

    theme_id: string | null;

    created_at: string;
    updated_at: string;
};

function assertSupabaseReady() {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) {
        throw new Error(
            "Supabase env가 없습니다. .env.local에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 설정 후 dev 서버를 재시작하세요."
        );
    }
}

function extOf(name: string) {
    const i = name.lastIndexOf(".");
    return i >= 0 ? name.slice(i + 1).toLowerCase() : "jpg";
}

function isHttpUrl(s: string) {
    return /^https?:\/\//i.test(s);
}

/* =========================================================
   ✅ Storage (private bucket) helpers
   ========================================================= */

const THUMB_BUCKET = "product-thumbnails";
const SIGN_EXPIRES_SEC = 60 * 60; // 1시간

// signed url 캐시(짧게)
const signedCache = new Map<string, { url: string; expAt: number }>();

async function getSignedUrl(path: string) {
    // 캐시
    const cached = signedCache.get(path);
    const now = Date.now();
    if (cached && cached.expAt > now) return cached.url;

    const { data, error } = await supabase.storage
        .from(THUMB_BUCKET)
        .createSignedUrl(path, SIGN_EXPIRES_SEC);

    if (error) {
        console.error("createSignedUrl error:", error);
        throw new Error(error.message);
    }

    const url = data.signedUrl;
    signedCache.set(path, { url, expAt: now + (SIGN_EXPIRES_SEC - 30) * 1000 });
    return url;
}

function safeUUID() {
    // randomUUID 미지원 브라우저 대비
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return (crypto as any).randomUUID();
    }
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/**
 * ✅ private bucket 썸네일 업로드
 * - 반환값은 storage path (thumb/xxx.jpg)
 */
export async function uploadProductThumbnail(file: File) {
    const ext = extOf(file.name);
    const path = `thumb/${safeUUID()}.${ext}`;

    const { error } = await supabase.storage.from(THUMB_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
    });

    if (error) {
        console.error("uploadProductThumbnail error:", error);
        throw new Error(error.message);
    }

    return path; // ✅ DB에는 이 path를 저장해야 함
}

export async function getSignedThumbnailUrl(path: string) {
    if (!path) return "";

    // 외부 URL이면 그대로
    if (/^https?:\/\//i.test(path)) return path;

    return await getSignedUrl(path);
}

/* =========================================================
   ✅ Row <-> Product mapping
   ========================================================= */

async function resolveThumbUrl(row: ProductRow) {
    // 우선순위: thumbnail_path -> thumbnail_url
    const raw = (row.thumbnail_path ?? row.thumbnail_url ?? "").trim();
    if (!raw) return "";

    // 이미 외부 URL이면 그대로
    if (isHttpUrl(raw)) return raw;

    // 그 외는 path로 보고 signed url 생성
    return await getSignedUrl(raw);
}

async function toProduct(row: ProductRow): Promise<Product> {
    const thumbUrl = await resolveThumbUrl(row);

    return {
        id: row.id,

        title: row.title ?? "",
        subtitle: row.subtitle ?? "",
        region: row.region ?? "",
        nights: row.nights ?? 0,
        days: row.days ?? 0,
        status: (row.status as any) ?? "DRAFT",

        priceText: row.price_text ?? "",
        description: row.description ?? "",

        thumbnailUrl: thumbUrl,
        thumbnailPath: row.thumbnail_path ?? undefined,

        images: Array.isArray(row.images) ? row.images : [],

        included: Array.isArray(row.included) ? row.included : [],
        excluded: Array.isArray(row.excluded) ? row.excluded : [],
        notices: Array.isArray(row.notices) ? row.notices : [],

        itinerary: Array.isArray(row.itinerary) ? row.itinerary : [],
        departures: Array.isArray(row.departures) ? row.departures : [],

        themeId: row.theme_id ?? null,

        createdAt: row.created_at ?? nowIso(),
        updatedAt: row.updated_at ?? nowIso(),
    };
}

function toRow(input: ProductUpsert): Omit<ProductRow, "id" | "created_at" | "updated_at"> {
    // ✅ DB에는 path 저장 (없으면 ""로)
    const pathOrUrl = (input.thumbnailPath ?? input.thumbnailUrl ?? "").trim();

    return {
        title: input.title ?? "",
        subtitle: input.subtitle ?? "",
        region: input.region ?? "",
        nights: input.nights ?? 0,
        days: input.days ?? 0,
        status: input.status ?? "DRAFT",

        price_text: input.priceText ?? "",
        description: input.description ?? "",

        // ✅ 절대 null 넣지 말자 (NOT NULL이면 특히)
        thumbnail_url: pathOrUrl,

        // ✅ path 따로 쓰고 싶으면 여기 저장
        thumbnail_path: input.thumbnailPath ?? null,

        images: Array.isArray(input.images) ? input.images : [],

        included: Array.isArray(input.included) ? input.included : [],
        excluded: Array.isArray(input.excluded) ? input.excluded : [],
        notices: Array.isArray(input.notices) ? input.notices : [],

        itinerary: Array.isArray(input.itinerary) ? input.itinerary : [],
        departures: Array.isArray(input.departures) ? input.departures : [],

        theme_id: input.themeId ?? null,
    };
}

/* =========================================================
   ✅ API-like functions
   ========================================================= */

export async function listProducts(params?: { q?: string; region?: string }) {
    assertSupabaseReady();

    const q = params?.q?.trim();
    const region = params?.region?.trim();

    let query = supabase.from("products").select("*").order("updated_at", { ascending: false });

    if (region && region !== "전체") query = query.eq("region", region);

    if (q) {
        const safe = q.replaceAll("%", "\\%").replaceAll(",", "\\,");
        query = query.or(`title.ilike.%${safe}%,subtitle.ilike.%${safe}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data ?? []) as ProductRow[];
    return await Promise.all(rows.map((r) => toProduct(r)));
}

export async function getProduct(id: string) {
    assertSupabaseReady();

    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) return null;

    return await toProduct(data as ProductRow);
}

export async function createProduct(input: ProductUpsert) {
    assertSupabaseReady();

    const row = toRow(input);

    const { data, error } = await supabase.from("products").insert(row).select("*").single();
    if (error) throw error;

    return await toProduct(data as ProductRow);
}

export async function updateProduct(id: string, input: ProductUpsert) {
    assertSupabaseReady();

    const row = toRow(input);

    const { data, error } = await supabase.from("products").update(row).eq("id", id).select("*").single();
    if (error) throw error;

    return await toProduct(data as ProductRow);
}

export async function deleteProduct(id: string) {
    assertSupabaseReady();

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;

    return true;
}
