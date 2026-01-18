
import type { Product } from "../../types/product";

export default function ProductInfoPanel({ product }: { product: Product }) {
    return (
        <div className="rounded-3xl border border-neutral-900 bg-neutral-900/20 p-6">
            <div className="text-xs text-neutral-400">{product.region}</div>
            <h1 className="mt-2 text-2xl font-semibold">{product.title}</h1>
            <p className="mt-2 text-neutral-300">{product.subtitle}</p>

            <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-neutral-200">{product.priceText}</div>
                <button className="rounded-full bg-neutral-50 px-5 py-2 text-sm font-semibold text-neutral-950">
                    상담하기
                </button>
            </div>

            <div className="mt-8 space-y-3 text-sm text-neutral-300">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4">
                    {product.description}
                </div>
            </div>
        </div>
    );
}
