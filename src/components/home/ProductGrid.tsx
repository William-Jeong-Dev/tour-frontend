import { useProducts } from "../../hooks/useProducts";
import ProductCard from "./ProductCard";

export default function ProductGrid({ className = "" }: { className?: string }) {
    const { data, isLoading } = useProducts();

    if (isLoading) return <div className="mt-6 text-sm text-neutral-300">로딩 중...</div>;

    return (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
            {(data ?? []).map((p) => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>
    );
}
