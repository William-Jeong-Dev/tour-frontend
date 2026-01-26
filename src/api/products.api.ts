import type { Product, ProductUpsert } from "../types/product";
import { supabase } from "../lib/supabase";

const nowIso = () => new Date().toISOString();

export function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/**
 * 정책:
 * - products.thumbnail_url 컬럼에는 "public url"이 아니라 "storage path"를 저장할 수 있음
 * - (현재 버킷은 Public ON) => 화면에서는 getPublicUrl로 변환해서 Product.thumbnailUrl로 내려준다.
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
    thumbnail_url: string;
    thumbnail_path: string | null;

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
   ✅ Storage (PUBLIC bucket) helpers
   ========================================================= */

export const THUMB_BUCKET = "product-thumbnails";

/**
 * DB에 저장된 값이 다음 형태로 섞여있을 수 있어서 정규화:
 * - "thumb/xxx.png" (정상)
 * - "/thumb/xxx.png" (앞에 / 붙은 케이스)
 * - "product-thumbnails/thumb/xxx.png" (버킷 prefix가 들어간 케이스)
 * - "/product-thumbnails/thumb/xxx.png"
 *
 * ✅ 주의: "thumb/" 폴더명은 실제 폴더일 가능성이 높으니 제거하면 안 됨.
 */
export function normalizeThumbPath(raw: string) {
    const p = String(raw ?? "").trim();
    if (!p) return "";

    // 1) leading slash 제거
    let x = p.replace(/^\/+/, "");

    // 2) 버킷 prefix 제거
    const prefix = `${THUMB_BUCKET}/`;
    if (x.startsWith(prefix)) x = x.slice(prefix.length);

    return x;
}

export function getPublicThumbnailUrl(pathOrUrl: string) {
    const raw = String(pathOrUrl ?? "").trim();
    if (!raw) return "";

    // 외부 URL이면 그대로
    if (isHttpUrl(raw)) return raw;

    // storage path 정규화 후 public url 생성
    const path = normalizeThumbPath(raw);
    const { data } = supabase.storage.from(THUMB_BUCKET).getPublicUrl(path);
    return data?.publicUrl ?? "";
}

/**
 * ✅ public bucket 썸네일 업로드
 * - 반환값은 storage path (thumb/xxx.jpg)
 */
export async function uploadProductThumbnail(file: File) {
    const ext = extOf(file.name);
    const path = `thumb/${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`}.${ext}`;

    const { error } = await supabase.storage.from(THUMB_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
    });

    if (error) {
        console.error("uploadProductThumbnail error:", error);
        throw new Error(error.message);
    }

    return path; // ✅ DB에는 이 path 저장
}

/* =========================================================
   ✅ Row <-> Product mapping
   ========================================================= */

async function toProduct(row: ProductRow): Promise<Product> {
    // 우선순위: thumbnail_path -> thumbnail_url
    const raw = (row.thumbnail_path ?? row.thumbnail_url ?? "").trim();
    const thumbUrl = getPublicThumbnailUrl(raw);

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

        thumbnail_url: pathOrUrl,
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

export async function listProducts(params?: { q?: string; region?: string; status?: string }) {
    assertSupabaseReady();

    const q = params?.q?.trim();
    const region = params?.region?.trim();
    const status = params?.status?.trim();

    let query = supabase.from("products").select("*").order("updated_at", { ascending: false });

    if (status) query = query.eq("status", status);
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

/** ✅ (클라이언트 홈에서 쓰는) PUBLISHED만 */
export async function listPublishedProducts(params?: { q?: string; region?: string }) {
    return await listProducts({ ...params, status: "PUBLISHED" });
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