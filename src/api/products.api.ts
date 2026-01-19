import type { Product, ProductUpsert } from "../types/product";

const now = () => new Date().toISOString();

export function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

// ---- Mock DB ----
let DB: Product[] = Array.from({ length: 12 }).map((_, i) => {
    const base = 900000 + i * 10000;

    return {
        id: String(i + 1),

        title: `프리미엄 여행 패키지 ${i + 1}`,
        subtitle: "핵심 포인트 한 줄 설명",
        region: ["일본", "제주", "동남아", "유럽"][i % 4],
        nights: 3,
        days: 4,
        status: i % 3 === 0 ? "DRAFT" : "PUBLISHED",

        priceText: "상담 문의",
        description:
            "이 영역은 상세 설명(일정/포함/불포함/유의사항 등)을 넣는 자리입니다. 실제 서버 붙이면 API 데이터로 교체하세요.",

        thumbnailUrl:
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60",
        images: [
            "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1600&q=60",
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=60",
        ],

        included: ["호텔 숙박(조식 포함)", "그린피/카트피(조건부)"],
        excluded: ["왕복 항공권", "개인 경비"],
        notices: ["현지 사정에 따라 일정이 변경될 수 있습니다."],

        itinerary: [
            {
                id: uid("day"),
                dayNo: 1,
                title: "1일차",
                dateText: "",
                rows: [
                    {
                        id: uid("row"),
                        place: "",
                        transport: "",
                        time: "",
                        content: "(데모) 일정 내용을 입력하세요.",
                        mealMorning: "NONE",
                        mealLunch: "NONE",
                        mealDinner: "NONE",
                    },
                ],
            },
        ],

        // ✅ 출발일 + 오퍼(특가/이벤트) 샘플
        departures: [
            {
                id: uid("dep"),
                dateISO: "2026-03-21",
                offerType: "NORMAL",
                status: "AVAILABLE",
                priceAdult: base,
                remain: 10,
                min: 4,
                max: 20,
                note: "",
            },
            {
                id: uid("dep"),
                dateISO: "2026-03-21",
                offerType: "SPECIAL",
                status: "AVAILABLE",
                priceAdult: base - 80000,
                remain: 5,
                min: 2,
                max: 10,
                note: "특가 좌석 한정",
            },
            {
                id: uid("dep"),
                dateISO: "2026-03-22",
                offerType: "EVENT",
                status: "CONFIRMED",
                priceAdult: base + 50000,
                remain: 8,
                min: 4,
                max: 20,
                note: "출발확정 이벤트",
            },
            {
                id: uid("dep"),
                dateISO: "2026-03-25",
                offerType: "NORMAL",
                status: "INQUIRY",
                priceAdult: 0,
                note: "가격문의",
            },
        ],

        createdAt: now(),
        updatedAt: now(),
    };
});

// ---- API-like functions ----
export async function listProducts(params?: { q?: string; region?: string }) {
    const q = params?.q?.trim().toLowerCase();
    const region = params?.region?.trim();

    let items = [...DB];
    if (region && region !== "전체") items = items.filter((p) => p.region === region);
    if (q) items = items.filter((p) => (p.title + " " + p.subtitle).toLowerCase().includes(q));
    return items;
}

export async function getProduct(id: string) {
    return DB.find((p) => p.id === id) ?? null;
}

export async function createProduct(input: ProductUpsert) {
    const maxId = Math.max(0, ...DB.map((x) => Number(x.id) || 0));
    const id = String(maxId + 1);
    const item: Product = { id, ...input, createdAt: now(), updatedAt: now() };
    DB = [item, ...DB];
    return item;
}

export async function updateProduct(id: string, input: ProductUpsert) {
    const idx = DB.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    DB[idx] = { ...DB[idx], ...input, updatedAt: now() };
    return DB[idx];
}

export async function deleteProduct(id: string) {
    const before = DB.length;
    DB = DB.filter((p) => p.id !== id);
    return DB.length !== before;
}
