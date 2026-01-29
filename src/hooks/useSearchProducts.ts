import { useQuery } from "@tanstack/react-query";
import { searchPublishedProducts } from "../api/products.api";

export function useSearchProducts(q: string) {
    const keyword = (q ?? "").trim();

    return useQuery({
        queryKey: ["products", "search", keyword],
        queryFn: () => searchPublishedProducts(keyword, 50),
        enabled: !!keyword,
        staleTime: 30_000,
    });
}