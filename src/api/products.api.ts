import type { Product, ProductUpsert } from "../types/product";

const now = () => new Date().toISOString();

export function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

// ---- Mock DB ----
/**
 * ✅ Mock DB (localStorage 영속화)
 * - Admin에서 생성/수정한 데이터가 새로고침/재방문 후에도 남아있도록 localStorage에 저장합니다.
 * - "서버 없이 무료/저렴 운영" 목표를 위한 1단계.
 *
 * 주의:
 * - localStorage는 "브라우저/기기별"로 분리됩니다.
 * - Vercel 배포에서 "다른 사용자"에게 공유되는 DB가 아닙니다(서버리스 DB 붙이기 전까지는).
 */
const STORAGE_KEY = "tour_products_v1";

function hasWindow() {
    return typeof window !== "undefined";
}

function loadFromStorage(): Product[] | null {
    if (!hasWindow()) return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return null;
        return parsed as Product[];
    } catch {
        return null;
    }
}

function saveToStorage(items: Product[]) {
    if (!hasWindow()) return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        // ignore
    }
}

function seedProducts(): Product[] {
    return Array.from({ length: 12 }).map((_, i) => {
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
}

let DB: Product[] = loadFromStorage() ?? seedProducts();
// 최초 1회: seed가 뜬 경우도 storage에 반영
saveToStorage(DB);

function setDB(next: Product[]) {
    DB = next;
    saveToStorage(DB);
}

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
    setDB([item, ...DB]);
    return item;
}

export async function updateProduct(id: string, input: ProductUpsert) {
    const idx = DB.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    const next = [...DB];
    next[idx] = { ...next[idx], ...input, updatedAt: now() };
    setDB(next);
    return next[idx];
}

export async function deleteProduct(id: string) {
    const before = DB.length;
    setDB(DB.filter((p) => p.id !== id));
    return DB.length !== before;
}
