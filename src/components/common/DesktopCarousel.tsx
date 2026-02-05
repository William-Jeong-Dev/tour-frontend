import { useRef } from "react";

function ChevronLeftIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ChevronRightIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function DesktopCarousel<T>({
                                       items,
                                       renderItem,
                                   }: {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const scroll = (dir: "left" | "right") => {
        if (!ref.current) return;
        const first = ref.current.querySelector<HTMLElement>("[data-carousel-item]");
        const width = first?.offsetWidth ?? 300;
        ref.current.scrollBy({
            left: dir === "left" ? -width : width,
            behavior: "smooth",
        });
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
                aria-label="이전"
            >
                <ChevronLeftIcon />
            </button>

            <button
                type="button"
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
                aria-label="다음"
            >
                <ChevronRightIcon />
            </button>

            <div ref={ref} className="flex gap-6 overflow-x-auto scroll-smooth px-10 no-scrollbar">
                {items.map((item, idx) => (
                    <div key={idx} data-carousel-item>
                        {renderItem(item)}
                    </div>
                ))}
            </div>
        </div>
    );
}
