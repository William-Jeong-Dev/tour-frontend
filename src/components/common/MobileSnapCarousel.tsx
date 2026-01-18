import React, { useEffect, useMemo, useRef, useState } from "react";

type Props<T> = {
    items: T[];
    /** 각 아이템 렌더 */
    renderItem: (item: T, index: number) => React.ReactNode;
    /** 모바일에서 카드 너비(기본 78%) */
    itemWidthClassName?: string; // ex) "w-[78%] min-w-[78%]"
    /** 캐러셀 바깥쪽 마진 (Container px-6 상쇄용) */
    noteFullBleed?: boolean; // 기본 true
};

export default function MobileSnapCarousel<T>({
                                                  items,
                                                  renderItem,
                                                  itemWidthClassName = "w-[78%] min-w-[78%]",
                                                  noteFullBleed = true,
                                              }: Props<T>) {
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const [active, setActive] = useState(0);

    const wrapperClass = useMemo(() => {
        // Container(px-6)를 쓰는 구조라면 -mx-6로 좌우 풀블리드 느낌
        return noteFullBleed ? "-mx-6 md:mx-0" : "";
    }, [noteFullBleed]);

    useEffect(() => {
        const root = scrollerRef.current;
        if (!root) return;

        const itemsEl = Array.from(root.querySelectorAll<HTMLElement>("[data-snap-item='1']"));
        if (itemsEl.length === 0) return;

        // IntersectionObserver로 “현재 보이는 카드” 감지
        const io = new IntersectionObserver(
            (entries) => {
                // 가장 많이 보이는 entry를 active로
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

                if (!visible) return;

                const idx = itemsEl.indexOf(visible.target as HTMLElement);
                if (idx >= 0) setActive(idx);
            },
            {
                root,
                threshold: [0.5, 0.6, 0.7, 0.8],
            }
        );

        itemsEl.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [items]);

    const scrollToIndex = (idx: number) => {
        const root = scrollerRef.current;
        if (!root) return;

        const itemsEl = Array.from(root.querySelectorAll<HTMLElement>("[data-snap-item='1']"));
        const el = itemsEl[idx];
        if (!el) return;

        el.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    };

    if (items.length === 0) return null;

    return (
        <div className={wrapperClass}>
            <div
                ref={scrollerRef}
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2
                   [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
                {items.map((it, idx) => (
                    <div
                        key={idx}
                        data-snap-item="1"
                        className={`snap-start ${itemWidthClassName}`}
                    >
                        {renderItem(it, idx)}
                    </div>
                ))}
            </div>

            {/* 인디케이터(점) */}
            <div className="mt-3 flex items-center justify-center gap-2 md:hidden">
                {items.map((_, idx) => {
                    const isActive = idx === active;
                    return (
                        <button
                            key={idx}
                            type="button"
                            aria-label={`go to slide ${idx + 1}`}
                            onClick={() => scrollToIndex(idx)}
                            className={[
                                "h-2 rounded-full transition-all",
                                isActive ? "w-6 bg-neutral-900/70" : "w-2 bg-neutral-300",
                            ].join(" ")}
                        />
                    );
                })}
            </div>
        </div>
    );
}
