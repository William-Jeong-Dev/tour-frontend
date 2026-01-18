import type { Product, ProductUpsert } from "../types/product";

const now = () => new Date().toISOString();

let DB: Product[] = Array.from({ length: 12 }).map((_, i) => ({
    id: String(i + 1),
    title: `프리미엄 여행 패키지 ${i + 1}`,
    subtitle: "핵심 포인트 한 줄 설명",
    description:
        "이 영역은 상세 설명(일정/포함/불포함/유의사항 등)을 넣는 자리입니다. 실제 서버 붙이면 API 데이터로 교체하세요.",
    priceText: "상담 문의",
    region: ["일본", "제주", "동남아", "유럽"][i % 4],
    thumbnailUrl:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60",
    images: [
        "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1600&q=60",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=60",
    ],
    createdAt: now(),
    updatedAt: now(),
}));

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
    const id = String(Math.max(0, ...DB.map((x) => Number(x.id))) + 1);
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
