import { useQuery } from "@tanstack/react-query";
import { listPublishedProducts } from "../api/products.api";
import { useAdminProductsFilter } from "./useAdminProducts";

export function useProducts() {
    const { q, region } = useAdminProductsFilter();
    return useQuery({
        queryKey: ["products", { q, region }],
        queryFn: () => listPublishedProducts({ q, region }),
    });
}
