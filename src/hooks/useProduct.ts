import { useQuery } from "@tanstack/react-query";
import { getProduct } from "../api/products.api";

export function useProduct(id: string) {
    return useQuery({
        queryKey: ["product", id],
        queryFn: () => getProduct(id),
        enabled: !!id,
    });
}
