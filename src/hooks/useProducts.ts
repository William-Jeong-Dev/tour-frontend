import { useQuery } from "@tanstack/react-query";
import { listProducts } from "../api/products.api";
import { useAdminProductsFilter } from "./useAdminProducts";

export function useProducts() {
    const { q, region } = useAdminProductsFilter();
    return useQuery({
        queryKey: ["products", { q, region }],
        queryFn: () => listProducts({ q, region }),
    });
}
