// src/hooks/useAdminProducts.ts
import { create } from "zustand";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "../api/products.api";
import type { Product } from "../types/product";

type FilterState = {
    q: string;
    region: string;
    setQ: (v: string) => void;
    setRegion: (v: string) => void;
};

const filterStore = create<FilterState>((set) => ({
    q: "",
    region: "전체",
    setQ: (v) => set({ q: v }),
    setRegion: (v) => set({ region: v }),
}));

export function useAdminProductsFilter(): FilterState {
    return filterStore();
}

/**
 * ✅ 어드민은 전체 상품을 봐야 하므로 listProducts 사용
 * (PUBLISHED만 보는 훅이 필요하면 따로 만들면 됨)
 */
export function useAdminProducts() {
    const { q, region } = filterStore();

    return useQuery<Product[]>({
        queryKey: ["admin-products", { q, region }],
        queryFn: () => listProducts({ q, region }),
    });
}
