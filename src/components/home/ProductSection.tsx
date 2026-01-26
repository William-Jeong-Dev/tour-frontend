import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { cards } from "./mock";

export default function ProductSection({
                                           title,
                                           withTabs = false,
                                       }: {
    title: string;
    withTabs?: boolean;
}) {
    const tabs = ["실속골프", "시내골프", "겨울골프", "프리미엄"] as const;
    const [tab, setTab] = useState<(typeof tabs)[number]>("실속골프");

    const items = useMemo(() => {
        if (!withTabs) return cards;
        // 데모: 탭에 따라 카드 순서만 바꿈
        const copy = [...cards];
        if (tab === "프리미엄") return copy.reverse();
        if (tab === "겨울골프") return [copy[2], copy[1], copy[3], copy[0]].filter(Boolean);
        if (tab === "시내골프") return [copy[1], copy[2], copy[0], copy[3]].filter(Boolean);
        return copy;
    }, [withTabs, tab]);

    return (
        <section className="py-12">
            <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
                <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>

                {withTabs && (
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                                    tab === t
                                        ? "border-[#2E97F2] bg-[#2E97F2] text-white"
                                        : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((p) => (
                    <ProductCard key={p.id} item={p} />
                ))}
            </div>
        </section>
    );
}
