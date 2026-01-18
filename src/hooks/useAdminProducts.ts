import { create } from "zustand";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "../api/products.api";

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

export function useAdminProductsFilter() {
    return filterStore();
}

export function useAdminProducts() {
    const { q, region } = filterStore();
    return useQuery({
        queryKey: ["admin-products", { q, region }],
        queryFn: () => listProducts({ q, region }),
    });
}
