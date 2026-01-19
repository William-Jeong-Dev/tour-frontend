import type { Product, ProductUpsert } from "../types/product";
import { supabase } from "../lib/supabase";

const nowIso = () => new Date().toISOString();

export function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/**
 * Supabase DB 스키마(테이블: products)는 snake_case를 사용.
 * 프론트 타입(Product)은 camelCase.
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

    thumbnail_url: string;
    images: any[];

    included: any[];
    excluded: any[];
    notices: any[];

    itinerary: any[];
    departures: any[];

    created_at: string;
    updated_at: string;
};

function toProduct(row: ProductRow): Product {
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

        thumbnailUrl: row.thumbnail_url ?? "",
        images: Array.isArray(row.images) ? row.images : [],

        included: Array.isArray(row.included) ? row.included : [],
        excluded: Array.isArray(row.excluded) ? row.excluded : [],
        notices: Array.isArray(row.notices) ? row.notices : [],

        itinerary: Array.isArray(row.itinerary) ? row.itinerary : [],
        departures: Array.isArray(row.departures) ? row.departures : [],

        createdAt: row.created_at ?? nowIso(),
        updatedAt: row.updated_at ?? nowIso(),
    };
}

function toRow(input: ProductUpsert): Omit<ProductRow, "id" | "created_at" | "updated_at"> {
    return {
        title: input.title ?? "",
        subtitle: input.subtitle ?? "",
        region: input.region ?? "",
        nights: input.nights ?? 0,
        days: input.days ?? 0,
        status: input.status ?? "DRAFT",

        price_text: input.priceText ?? "",
        description: input.description ?? "",

        thumbnail_url: input.thumbnailUrl ?? "",
        images: Array.isArray(input.images) ? input.images : [],

        included: Array.isArray(input.included) ? input.included : [],
        excluded: Array.isArray(input.excluded) ? input.excluded : [],
        notices: Array.isArray(input.notices) ? input.notices : [],

        itinerary: Array.isArray(input.itinerary) ? input.itinerary : [],
        departures: Array.isArray(input.departures) ? input.departures : [],
    };
}

function assertSupabaseReady() {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) {
        throw new Error(
            "Supabase env가 없습니다. .env.local에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 설정 후 dev 서버를 재시작하세요."
        );
    }
}

// ---- API-like functions ----

/**
 * ✅ 기본 정렬: 최근 수정순(updated_at desc)
 */
export async function listProducts(params?: { q?: string; region?: string }) {
    assertSupabaseReady();

    const q = params?.q?.trim();
    const region = params?.region?.trim();

    let query = supabase.from("products").select("*").order("updated_at", { ascending: false });

    if (region && region !== "전체") query = query.eq("region", region);

    if (q) {
        // title 또는 subtitle에 포함
        // Supabase OR 문법: "a.ilike.%q%,b.ilike.%q%"
        const safe = q.replaceAll("%", "\\%").replaceAll(",", "\\,");
        query = query.or(`title.ilike.%${safe}%,subtitle.ilike.%${safe}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data ?? []) as ProductRow[];
    return rows.map(toProduct);
}

export async function getProduct(id: string) {
    assertSupabaseReady();

    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) return null;

    return toProduct(data as ProductRow);
}

export async function createProduct(input: ProductUpsert) {
    assertSupabaseReady();

    const row = toRow(input);

    const { data, error } = await supabase.from("products").insert(row).select("*").single();
    if (error) throw error;

    return toProduct(data as ProductRow);
}

export async function updateProduct(id: string, input: ProductUpsert) {
    assertSupabaseReady();

    const row = toRow(input);

    const { data, error } = await supabase.from("products").update(row).eq("id", id).select("*").single();
    if (error) throw error;

    return toProduct(data as ProductRow);
}

export async function deleteProduct(id: string) {
    assertSupabaseReady();

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;

    return true;
}
